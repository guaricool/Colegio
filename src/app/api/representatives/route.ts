import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function sanitize(input: string): string {
  return input ? input.replace(/<[^>]*>?/gm, '').trim() : '';
}

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
    console.error('Error al obtener representantes:', error);
    return NextResponse.json({ error: 'Error al obtener representantes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, cedula, phone, email, address } = body;

    if (!name || !cedula || !phone) {
      return NextResponse.json({ error: 'Nombre, cédula y teléfono son campos obligatorios' }, { status: 400 });
    }

    const cleanName = sanitize(name);
    const cleanCedula = sanitize(cedula).toUpperCase();
    const cleanPhone = sanitize(phone);
    const cleanEmail = email ? sanitize(email).toLowerCase() : null;
    const cleanAddress = address ? sanitize(address) : null;

    const rep = await prisma.representative.create({
      data: {
        name: cleanName,
        cedula: cleanCedula,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddress,
      },
    });
    return NextResponse.json(rep);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un representante registrado con esa cédula' }, { status: 400 });
    }
    console.error('Error al crear representante:', error);
    return NextResponse.json({ error: 'Error al crear representante' }, { status: 500 });
  }
}
