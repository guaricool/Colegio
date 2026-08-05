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

    const fee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
    });

    if (!fee) {
      return NextResponse.json({ error: 'Concepto de mensualidad no encontrado' }, { status: 404 });
    }

    const payUsd = parseFloat(amountUsd);
    const rate = parseFloat(bcvRate);
    const payVes = payUsd * rate;

    // Generar correlativo de recibo de pago
    const countPayments = await prisma.payment.count();
    const receiptNumber = `REC-${new Date().getFullYear()}-${String(countPayments + 1).padStart(4, '0')}`;

    const payment = await prisma.payment.create({
      data: {
        studentFeeId,
        paymentDate: new Date(),
        method,
        reference: reference || null,
        amountUsd: payUsd,
        amountVes: payVes,
        bcvRate: rate,
        notes: notes || null,
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

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error al registrar pago:', error);
    return NextResponse.json({ error: 'Error al registrar el pago' }, { status: 500 });
  }
}
