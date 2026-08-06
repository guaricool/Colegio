import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function fetchLiveBcvFromApi(): Promise<number | null> {
  try {
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data && typeof data.promedio === 'number' && data.promedio > 0) {
      return data.promedio;
    }
  } catch (error) {
    console.error('Error al consultar API BCV automática:', error);
  }
  return null;
}

export async function GET() {
  try {
    // 1. Intentar consultar la Tasa BCV Oficial en vivo automáticamente
    const liveRate = await fetchLiveBcvFromApi();

    if (liveRate !== null) {
      // Guardar en BD si cambió respecto a la última registrada
      const latestDbRate = await prisma.bcvRate.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!latestDbRate || Math.abs(latestDbRate.rate - liveRate) > 0.001) {
        await prisma.bcvRate.create({
          data: { rate: liveRate },
        });
      }

      return NextResponse.json({
        rate: liveRate,
        date: new Date(),
        source: 'BCV_AUTOMATIC_LIVE',
      });
    }

    // 2. Si falla la red, consultar la última registrada en BD
    const dbRate = await prisma.bcvRate.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      rate: dbRate?.rate ?? 105.8,
      date: dbRate?.date ?? new Date(),
      source: 'DATABASE_FALLBACK',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener la Tasa BCV' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Sincronización automática a demanda
    if (body.auto) {
      const liveRate = await fetchLiveBcvFromApi();
      if (liveRate !== null) {
        const newRate = await prisma.bcvRate.create({
          data: { rate: liveRate },
        });
        return NextResponse.json({
          rate: newRate.rate,
          date: newRate.date,
          source: 'BCV_AUTOMATIC_LIVE',
        });
      }
      return NextResponse.json({ error: 'No se pudo obtener la tasa BCV automáticamente' }, { status: 502 });
    }

    // Actualización manual
    const rateNumber = parseFloat(body.rate);
    if (isNaN(rateNumber) || rateNumber <= 0) {
      return NextResponse.json({ error: 'Tasa BCV inválida' }, { status: 400 });
    }

    const newRate = await prisma.bcvRate.create({
      data: { rate: rateNumber },
    });

    return NextResponse.json({
      rate: newRate.rate,
      date: newRate.date,
      source: 'MANUAL',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar Tasa BCV' }, { status: 500 });
  }
}
