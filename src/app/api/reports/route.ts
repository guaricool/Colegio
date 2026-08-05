import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const latestRate = await prisma.bcvRate.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    const rate = latestRate?.rate ?? 105.8;

    const allFees = await prisma.studentFee.findMany({
      include: {
        student: {
          include: {
            grade: true,
            representative: true,
          },
        },
        payments: true,
      },
    });

    const allPayments = await prisma.payment.findMany({
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

    // 1. Métricas Totales
    let totalCollectedUsd = 0;
    let totalCollectedVes = 0;

    allPayments.forEach((p) => {
      totalCollectedUsd += p.amountUsd;
      totalCollectedVes += p.amountVes;
    });

    let totalPendingUsd = 0;
    let totalOverdueUsd = 0;
    let totalPaidFeesCount = 0;

    const now = new Date();

    allFees.forEach((f) => {
      const pendingUsd = Math.max(0, f.amountUsd - f.paidUsd);
      totalPendingUsd += pendingUsd;
      if (pendingUsd > 0 && new Date(f.dueDate) < now) {
        totalOverdueUsd += pendingUsd;
      }
      if (f.status === 'PAID') {
        totalPaidFeesCount++;
      }
    });

    const totalFeesCount = allFees.length || 1;
    const collectionEfficiencyPercent = Math.round((totalPaidFeesCount / totalFeesCount) * 100);

    // 2. Ingresos por Método de Pago
    const methodSummaryMap: Record<string, { count: number; usd: number; ves: number }> = {
      PAGO_MOVIL: { count: 0, usd: 0, ves: 0 },
      ZELLE: { count: 0, usd: 0, ves: 0 },
      TRANSFERENCIA_VES: { count: 0, usd: 0, ves: 0 },
      EFECTIVO_USD: { count: 0, usd: 0, ves: 0 },
      EFECTIVO_VES: { count: 0, usd: 0, ves: 0 },
    };

    allPayments.forEach((p) => {
      if (!methodSummaryMap[p.method]) {
        methodSummaryMap[p.method] = { count: 0, usd: 0, ves: 0 };
      }
      methodSummaryMap[p.method].count += 1;
      methodSummaryMap[p.method].usd += p.amountUsd;
      methodSummaryMap[p.method].ves += p.amountVes;
    });

    // 3. Deuda por Grado
    const gradeDebtMap: Record<string, { gradeName: string; section: string; pendingUsd: number; studentCount: number }> = {};

    allFees.forEach((f) => {
      const pendingUsd = Math.max(0, f.amountUsd - f.paidUsd);
      if (pendingUsd > 0 && f.student?.grade) {
        const key = f.student.grade.id;
        if (!gradeDebtMap[key]) {
          gradeDebtMap[key] = {
            gradeName: f.student.grade.name,
            section: f.student.grade.section,
            pendingUsd: 0,
            studentCount: 0,
          };
        }
        gradeDebtMap[key].pendingUsd += pendingUsd;
        gradeDebtMap[key].studentCount += 1;
      }
    });

    return NextResponse.json({
      bcvRate: rate,
      summary: {
        totalCollectedUsd,
        totalCollectedVes,
        totalPendingUsd,
        totalPendingVes: totalPendingUsd * rate,
        totalOverdueUsd,
        totalOverdueVes: totalOverdueUsd * rate,
        collectionEfficiencyPercent,
        totalStudentsCount: await prisma.student.count(),
        totalRepresentativesCount: await prisma.representative.count(),
      },
      methodSummary: Object.entries(methodSummaryMap).map(([method, data]) => ({
        method,
        ...data,
      })),
      gradeDebt: Object.values(gradeDebtMap),
    });
  } catch (error) {
    console.error('Error al generar reportes:', error);
    return NextResponse.json({ error: 'Error al generar reporte contable' }, { status: 500 });
  }
}
