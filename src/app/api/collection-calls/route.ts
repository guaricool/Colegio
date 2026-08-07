import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const feeId = searchParams.get('feeId');

    const whereClause: any = {};
    if (feeId) {
      whereClause.studentFeeId = feeId;
    }

    const calls = await prisma.collectionCall.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, role: true, username: true },
        },
        studentFee: {
          include: {
            student: {
              include: {
                representative: true,
                grade: true,
              },
            },
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular estadísticas globales de auditoría de cobranza
    const totalCalls = calls.length;
    const contactedCount = calls.filter((c) => c.status === 'CONTACTED').length;
    const noAnswerCount = calls.filter((c) => c.status === 'NO_ANSWER').length;
    
    // Cruce: Gestiones que resultaron en un pago exitoso
    const convertedCalls = calls.filter((c) => c.result === 'CONVERTED_PAID' || c.studentFee.status === 'PAID');
    const convertedCount = convertedCalls.length;
    
    // Dinero recuperado por gestiones de cobranza ($)
    const recoveredUsd = convertedCalls.reduce((acc, c) => acc + (c.studentFee.paidUsd || c.studentFee.amountUsd), 0);

    // Tasa de conversión (%)
    const conversionRate = totalCalls > 0 ? (convertedCount / totalCalls) * 100 : 0;

    // Agrupación por operador/usuario
    const operatorStats: Record<string, any> = {};
    calls.forEach((c) => {
      const opName = c.user ? `${c.user.firstName} ${c.user.lastName}` : c.operatorName || 'Personal de Cobranza';
      if (!operatorStats[opName]) {
        operatorStats[opName] = {
          operatorName: opName,
          totalCalls: 0,
          contacted: 0,
          noAnswer: 0,
          converted: 0,
          recoveredUsd: 0,
        };
      }
      operatorStats[opName].totalCalls += 1;
      if (c.status === 'CONTACTED') operatorStats[opName].contacted += 1;
      if (c.status === 'NO_ANSWER') operatorStats[opName].noAnswer += 1;
      if (c.result === 'CONVERTED_PAID' || c.studentFee.status === 'PAID') {
        operatorStats[opName].converted += 1;
        operatorStats[opName].recoveredUsd += (c.studentFee.paidUsd || c.studentFee.amountUsd);
      }
    });

    return NextResponse.json({
      calls,
      stats: {
        totalCalls,
        contactedCount,
        noAnswerCount,
        convertedCount,
        recoveredUsd,
        conversionRate,
        operators: Object.values(operatorStats),
      },
    });
  } catch (error) {
    console.error('Error fetching collection calls:', error);
    return NextResponse.json({ error: 'Error al obtener gestiones de cobranza' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentFeeId, status, notes, userId, operatorName } = body;

    if (!studentFeeId || !status) {
      return NextResponse.json({ error: 'Faltan campos requeridos (studentFeeId, status)' }, { status: 400 });
    }

    // Verificar si la mensualidad ya está pagada
    const studentFee = await prisma.studentFee.findUnique({
      where: { id: studentFeeId },
    });

    if (!studentFee) {
      return NextResponse.json({ error: 'Mensualidad no encontrada' }, { status: 404 });
    }

    const isAlreadyPaid = studentFee.status === 'PAID';

    const newCall = await prisma.collectionCall.create({
      data: {
        studentFeeId,
        userId: userId || null,
        operatorName: operatorName || 'Personal de Cobranza',
        status, // "CONTACTED" | "NO_ANSWER"
        notes: notes || (status === 'NO_ANSWER' ? 'Intento de llamada fallido - No contestó' : ''),
        result: isAlreadyPaid ? 'CONVERTED_PAID' : 'PENDING',
        paidAt: isAlreadyPaid ? new Date() : null,
      },
      include: {
        studentFee: {
          include: {
            student: {
              include: { representative: true, grade: true },
            },
          },
        },
      },
    });

    return NextResponse.json(newCall, { status: 201 });
  } catch (error) {
    console.error('Error creating collection call:', error);
    return NextResponse.json({ error: 'Error al registrar gestión de llamada' }, { status: 500 });
  }
}
