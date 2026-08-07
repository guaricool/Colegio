import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        studentFee: {
          include: {
            student: {
              include: {
                representative: true,
                grade: true,
              },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });
    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener historial de pagos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentFeeId, method, reference, amountUsd, bcvRate, notes } = body;

    if (!studentFeeId || !method || !amountUsd || !bcvRate) {
      return NextResponse.json({ error: 'Faltan campos obligatorios para registrar el pago' }, { status: 400 });
    }

    const payUsd = parseFloat(amountUsd);
    const rate = parseFloat(bcvRate);

    if (isNaN(payUsd) || payUsd <= 0) {
      return NextResponse.json({ error: 'El monto ingresado debe ser mayor a cero' }, { status: 400 });
    }

    if (isNaN(rate) || rate <= 0) {
      return NextResponse.json({ error: 'La tasa BCV debe ser mayor a cero' }, { status: 400 });
    }

    const fee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
    });

    if (!fee) {
      return NextResponse.json({ error: 'Concepto de mensualidad no encontrado' }, { status: 404 });
    }

    const payVes = payUsd * rate;

    // Generar correlativo de recibo de pago con timestamp para evitar colisiones en transacciones concurrentes
    const countPayments = await prisma.payment.count();
    const uniqueStamp = Math.floor(100 + Math.random() * 900);
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(countPayments + 1).padStart(4, '0')}-${uniqueStamp}`;

    const payment = await prisma.payment.create({
      data: {
        studentFeeId,
        paymentDate: new Date(),
        method,
        reference: reference ? String(reference).trim() : null,
        amountUsd: payUsd,
        amountVes: payVes,
        bcvRate: rate,
        notes: notes ? String(notes).trim() : null,
        receiptNumber,
      },
      include: {
        studentFee: {
          include: {
            student: {
              include: {
                representative: true,
                grade: true,
              },
            },
          },
        },
      },
    });

    // Actualizar estado de la mensualidad
    const newPaidUsd = fee.paidUsd + payUsd;
    let newStatus = 'PARTIAL';
    if (newPaidUsd >= fee.amountUsd - 0.01) {
      newStatus = 'PAID';
    }

    await prisma.studentFee.update({
      where: { id: studentFeeId },
      data: {
        paidUsd: newPaidUsd,
        status: newStatus,
      },
    });

    // Cruce de historial: Actualizar gestiones de cobranza previas a pago confirmado
    await prisma.collectionCall.updateMany({
      where: { studentFeeId, result: 'PENDING' },
      data: {
        result: 'CONVERTED_PAID',
        paidAt: new Date(),
      },
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('Error al registrar pago:', error);
    return NextResponse.json({ error: 'Error interno al registrar el pago' }, { status: 500 });
  }
}
