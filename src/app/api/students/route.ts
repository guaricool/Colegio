import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        representative: true,
        grade: true,
        fees: {
          include: {
            payments: true,
          },
          orderBy: { dueDate: 'desc' },
        },
      },
      orderBy: { lastName: 'asc' },
    });
    return NextResponse.json(students);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const student = await prisma.student.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        cedula: body.cedula,
        scholarshipPercent: parseFloat(body.scholarshipPercent || '0'),
        representativeId: body.representativeId,
        gradeId: body.gradeId,
      },
      include: {
        grade: true,
      },
    });

    // Opcional: Generar mensualidad inicial si se especifica
    if (body.initialFeeConcept) {
      const discount = (student.grade.monthlyFeeUsd * student.scholarshipPercent) / 100;
      const finalAmount = Math.max(0, student.grade.monthlyFeeUsd - discount);
      await prisma.studentFee.create({
        data: {
          studentId: student.id,
          conceptName: body.initialFeeConcept,
          amountUsd: finalAmount,
          dueDate: new Date(body.dueDate || Date.now()),
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un estudiante con esa cédula o código escolar' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al registrar estudiante' }, { status: 500 });
  }
}
