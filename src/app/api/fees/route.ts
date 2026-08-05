import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fees = await prisma.studentFee.findMany({
      include: {
        student: {
          include: {
            representative: true,
            grade: true,
          },
        },
        payments: true,
      },
      orderBy: { dueDate: 'desc' },
    });
    return NextResponse.json(fees);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener mensualidades/cargos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generar masivamente por grado o individual
    if (body.action === 'GENERATE_MASSIVE') {
      const { conceptName, dueDate, gradeId } = body;
      
      const queryFilter = gradeId ? { gradeId, status: 'ACTIVE' } : { status: 'ACTIVE' };
      const students = await prisma.student.findMany({
        where: queryFilter,
        include: { grade: true },
      });

      const createdFees = [];
      for (const st of students) {
        const discount = (st.grade.monthlyFeeUsd * st.scholarshipPercent) / 100;
        const finalAmountUsd = Math.max(0, st.grade.monthlyFeeUsd - discount);

        const fee = await prisma.studentFee.create({
          data: {
            studentId: st.id,
            conceptName,
            amountUsd: finalAmountUsd,
            dueDate: new Date(dueDate),
            status: 'PENDING',
          },
        });
        createdFees.push(fee);
      }

      return NextResponse.json({ count: createdFees.length, fees: createdFees });
    }

    // Individual
    const { studentId, conceptName, amountUsd, dueDate } = body;
    const fee = await prisma.studentFee.create({
      data: {
        studentId,
        conceptName,
        amountUsd: parseFloat(amountUsd),
        dueDate: new Date(dueDate),
        status: 'PENDING',
      },
    });

    return NextResponse.json(fee);
  } catch (error) {
    return NextResponse.json({ error: 'Error al generar cobros' }, { status: 500 });
  }
}
