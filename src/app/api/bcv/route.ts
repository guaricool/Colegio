import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const latestRate = await prisma.bcvRate.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ rate: latestRate?.rate ?? 105.8, date: latestRate?.date ?? new Date() });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener tasa BCV' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rateNumber = parseFloat(body.rate);
    if (isNaN(rateNumber) || rateNumber <= 0) {
      return NextResponse.json({ error: 'Tasa BCV inválida' }, { status: 400 });
    }

    const newRate = await prisma.bcvRate.create({
      data: {
        rate: rateNumber,
      },
    });

    return NextResponse.json(newRate);
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar tasa BCV' }, { status: 500 });
  }
}
