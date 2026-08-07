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
          email: 'admonpierluissi@gmail.com',
          address: 'Prebo II, Valencia, Carabobo, Venezuela',
          pagoMovilBank: 'Banesco (0134)',
          pagoMovilPhone: '0414-7890123',
          pagoMovilRif: 'J-31489201-4',
          zelleEmail: 'pagos@colegioramonpierluissi.com',
          zelleName: 'Colegio Ramón Pierluissi C.A.',
          standardMonthlyFeeEur: 270.0,
          earlyPaymentDayCutoff: 10,
          earlyPaymentFeeEur: 256.0,
          latePaymentFeeEur: 280.0,
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
        pagoMovilBank: body.pagoMovilBank,
        pagoMovilPhone: body.pagoMovilPhone,
        pagoMovilRif: body.pagoMovilRif,
        zelleEmail: body.zelleEmail,
        zelleName: body.zelleName,
        totalPagoApiKey: body.totalPagoApiKey,
        totalPagoMerchantId: body.totalPagoMerchantId,
        provincialC2PKey: body.provincialC2PKey,
        standardMonthlyFeeEur: parseFloat(body.standardMonthlyFeeEur ?? 270),
        earlyPaymentDayCutoff: parseInt(body.earlyPaymentDayCutoff ?? 10),
        earlyPaymentFeeEur: parseFloat(body.earlyPaymentFeeEur ?? 256),
        latePaymentFeeEur: parseFloat(body.latePaymentFeeEur ?? 280),
      },
      create: {
        id: 'default',
        name: body.name || 'Colegio Ramón Pierluissi',
        rif: body.rif || 'J-31489201-4',
        phone: body.phone || '+58 414-7890123',
        email: body.email || 'admonpierluissi@gmail.com',
        address: body.address || 'Prebo II, Valencia, Carabobo',
        pagoMovilBank: body.pagoMovilBank || 'Banesco (0134)',
        pagoMovilPhone: body.pagoMovilPhone || '0414-7890123',
        pagoMovilRif: body.pagoMovilRif || 'J-31489201-4',
        zelleEmail: body.zelleEmail || 'pagos@colegioramonpierluissi.com',
        zelleName: body.zelleName || 'Colegio Ramón Pierluissi C.A.',
        totalPagoApiKey: body.totalPagoApiKey,
        totalPagoMerchantId: body.totalPagoMerchantId,
        provincialC2PKey: body.provincialC2PKey,
        standardMonthlyFeeEur: parseFloat(body.standardMonthlyFeeEur ?? 270),
        earlyPaymentDayCutoff: parseInt(body.earlyPaymentDayCutoff ?? 10),
        earlyPaymentFeeEur: parseFloat(body.earlyPaymentFeeEur ?? 256),
        latePaymentFeeEur: parseFloat(body.latePaymentFeeEur ?? 280),
      },
    });
    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
