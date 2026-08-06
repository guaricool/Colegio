import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function fetchLiveBcvRates(): Promise<{ usd: number | null; eur: number | null }> {
  let usd: number | null = null;
  let eur: number | null = null;

  try {
    const [usdRes, eurRes] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial', { cache: 'no-store' }),
      fetch('https://ve.dolarapi.com/v1/euros/oficial', { cache: 'no-store' }),
    ]);

    if (usdRes.ok) {
      const usdData = await usdRes.json();
      if (usdData && typeof usdData.promedio === 'number' && usdData.promedio > 0) {
        usd = usdData.promedio;
      }
    }

    if (eurRes.ok) {
      const eurData = await eurRes.json();
      if (eurData && typeof eurData.promedio === 'number' && eurData.promedio > 0) {
        eur = eurData.promedio;
      }
    }
  } catch (error) {
    console.error('Error al consultar API BCV en vivo (USD/EUR):', error);
  }

  return { usd, eur };
}

export async function GET() {
  try {
    const liveRates = await fetchLiveBcvRates();

    if (liveRates.usd !== null && liveRates.eur !== null) {
      const latestDbRate = await prisma.bcvRate.findFirst({
        orderBy: { createdAt: 'desc' },
      });

      if (!latestDbRate || Math.abs(latestDbRate.rate - liveRates.usd) > 0.001 || Math.abs(latestDbRate.eurRate - liveRates.eur) > 0.001) {
        await prisma.bcvRate.create({
          data: {
            rate: liveRates.usd,
            eurRate: liveRates.eur,
          },
        });
      }

      return NextResponse.json({
        rate: liveRates.usd,
        usdRate: liveRates.usd,
        eurRate: liveRates.eur,
        date: new Date(),
        source: 'BCV_AUTOMATIC_LIVE',
      });
    }

    // Fallback a Base de Datos
    const dbRate = await prisma.bcvRate.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      rate: dbRate?.rate ?? 75.51,
      usdRate: dbRate?.rate ?? 75.51,
      eurRate: dbRate?.eurRate ?? 81.20,
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

    if (body.auto) {
      const liveRates = await fetchLiveBcvRates();
      if (liveRates.usd !== null && liveRates.eur !== null) {
        const newRate = await prisma.bcvRate.create({
          data: {
            rate: liveRates.usd,
            eurRate: liveRates.eur,
          },
        });
        return NextResponse.json({
          rate: newRate.rate,
          usdRate: newRate.rate,
          eurRate: newRate.eurRate,
          date: newRate.date,
          source: 'BCV_AUTOMATIC_LIVE',
        });
      }
      return NextResponse.json({ error: 'No se pudo obtener las tasas del BCV automáticamente' }, { status: 502 });
    }

    const usdNumber = parseFloat(body.rate || body.usdRate);
    const eurNumber = parseFloat(body.eurRate || '0');

    if (isNaN(usdNumber) || usdNumber <= 0) {
      return NextResponse.json({ error: 'Tasa USD inválida' }, { status: 400 });
    }

    const newRate = await prisma.bcvRate.create({
      data: {
        rate: usdNumber,
        eurRate: eurNumber > 0 ? eurNumber : usdNumber * 1.08,
      },
    });

    return NextResponse.json({
      rate: newRate.rate,
      usdRate: newRate.rate,
      eurRate: newRate.eurRate,
      date: newRate.date,
      source: 'MANUAL',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar Tasa BCV' }, { status: 500 });
  }
}
