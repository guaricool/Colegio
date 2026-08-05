import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const representatives = await prisma.representative.findMany({
      include: {
        students: {
          include: {
            grade: true,
            fees: {
              include: {
                payments: true,
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(representatives);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener representantes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rep = await prisma.representative.create({
      data: {
        name: body.name,
        cedula: body.cedula,
        phone: body.phone,
        email: body.email,
        address: body.address,
      },
    });
    return NextResponse.json(rep);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un representante registrado con esa cédula' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error al crear representante' }, { status: 500 });
  }
}
