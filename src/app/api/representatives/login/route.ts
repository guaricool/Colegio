import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cedula } = body;

    if (!cedula || typeof cedula !== 'string') {
      return NextResponse.json({ error: 'La Cédula de Identidad es requerida' }, { status: 400 });
    }

    const cleanCedula = cedula.trim().toLowerCase();

    // Buscar por cédula o teléfono
    const representative = await prisma.representative.findFirst({
      where: {
        OR: [
          { cedula: { contains: cleanCedula } },
          { phone: { contains: cleanCedula } },
        ],
      },
      include: {
        students: {
          include: {
            grade: true,
            fees: {
              orderBy: { dueDate: 'asc' },
            },
          },
        },
      },
    });

    if (!representative) {
      return NextResponse.json(
        { error: 'No se encontró ningún representante registrado con esa Cédula de Identidad' },
        { status: 404 }
      );
    }

    return NextResponse.json(representative);
  } catch (error: any) {
    console.error('Error en login de representante:', error);
    return NextResponse.json({ error: 'Error al procesar el inicio de sesión' }, { status: 500 });
  }
}
