import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function sanitize(input: string): string {
  return input ? input.replace(/<[^>]*>?/gm, '').trim() : '';
}

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
    console.error('Error al obtener estudiantes:', error);
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, cedula, scholarshipPercent, representativeId, gradeId } = body;

    if (!firstName || !lastName || !cedula || !representativeId || !gradeId) {
      return NextResponse.json({ error: 'Nombre, apellido, cédula, representante y grado son obligatorios' }, { status: 400 });
    }

    const cleanFirstName = sanitize(firstName);
    const cleanLastName = sanitize(lastName);
    const cleanCedula = sanitize(cedula).toUpperCase();
    const cleanScholarship = Math.max(0, Math.min(100, parseFloat(scholarshipPercent || '0')));

    const student = await prisma.student.create({
      data: {
        firstName: cleanFirstName,
        lastName: cleanLastName,
        cedula: cleanCedula,
        scholarshipPercent: isNaN(cleanScholarship) ? 0 : cleanScholarship,
        representativeId,
        gradeId,
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
          conceptName: sanitize(body.initialFeeConcept),
          amountUsd: finalAmount,
          dueDate: new Date(body.dueDate || Date.now()),
          status: 'PENDING',
        },
      });
    }

    return NextResponse.json(student);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un estudiante registrado con esa cédula o código escolar' }, { status: 400 });
    }
    console.error('Error al registrar estudiante:', error);
    return NextResponse.json({ error: 'Error al registrar estudiante' }, { status: 500 });
  }
}
