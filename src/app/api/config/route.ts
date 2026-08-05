import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.schoolConfig.findFirst({ where: { id: 'default' } });
    if (!config) {
      config = await prisma.schoolConfig.create({
        data: {
          id: 'default',
          name: 'Colegio Ramón Pierluissi',
          rif: 'J-31489201-4',
          phone: '+58 414-7890123',
          email: 'admin@colegioramonpierluissi.com',
          address: 'Calle Principal, Sector El Colegio, Estado Carabobo, Venezuela',
          bankDetails: 'Pago Móvil Banesco 0134 - CI 14582910 - Tel 04147890123',
        },
      });
    }
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener configuración del colegio' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const config = await prisma.schoolConfig.upsert({
      where: { id: 'default' },
      update: {
        name: body.name,
        rif: body.rif,
        phone: body.phone,
        email: body.email,
        address: body.address,
        bankDetails: body.bankDetails,
      },
      create: {
        id: 'default',
        name: body.name,
        rif: body.rif,
        phone: body.phone,
        email: body.email,
        address: body.address,
        bankDetails: body.bankDetails,
      },
    });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
