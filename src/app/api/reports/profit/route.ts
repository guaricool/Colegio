import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('type') || 'payments'; // 'clients' | 'payments'
    const weekendOnly = searchParams.get('weekendOnly') === 'true';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (exportType === 'clients') {
      const representatives = await prisma.representative.findMany({
        include: {
          students: true,
        },
      });

      const formattedClients = representatives.map((r) => ({
        co_cli: r.cedula,
        cli_des: r.name,
        rif: r.cedula.startsWith('J-') || r.cedula.startsWith('V-') ? r.cedula : `V-${r.cedula}`,
        dir: 'Prebo II, Valencia, Carabobo',
        telefonos: r.phone,
        email: r.email || 'sin_correo@colegio.com',
        fec_emis: r.createdAt.toISOString().split('T')[0],
        coment: `Representante de ${r.students.map((s) => `${s.firstName} ${s.lastName}`).join(', ')}`,
      }));

      return NextResponse.json({
        success: true,
        tableName: 'saCliente',
        count: formattedClients.length,
        data: formattedClients,
      });
    }

    // Filtrar pagos por fecha / fin de semana
    let whereClause: any = {};

    if (weekendOnly) {
      // Filtrar cobros realizados en sábados y domingos de los últimos 7 días
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      whereClause.paymentDate = { gte: sevenDaysAgo };
    } else if (startDateParam && endDateParam) {
      whereClause.paymentDate = {
        gte: new Date(startDateParam),
        lte: new Date(endDateParam),
      };
    }

    const payments = await prisma.payment.findMany({
      where: whereClause,
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

    // Filtrar explícitamente días del fin de semana si weekendOnly es true
    const filteredPayments = weekendOnly
      ? payments.filter((p) => {
          const day = new Date(p.paymentDate).getDay();
          return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
        })
      : payments;

    const formattedPayments = filteredPayments.map((p) => {
      const rep = p.studentFee?.student?.representative;
      const student = p.studentFee?.student;

      return {
        fact_num: p.receiptNumber,
        fec_emis: new Date(p.paymentDate).toISOString().split('T')[0],
        co_cli: rep?.cedula || 'V-00000000',
        cli_des: rep?.name || 'Cliente Genérico',
        rif: rep?.cedula ? (rep.cedula.startsWith('V-') || rep.cedula.startsWith('J-') ? rep.cedula : `V-${rep.cedula}`) : 'V-00000000',
        forma_pag: p.method,
        num_ref: p.reference || 'N/A',
        monto_usd: p.amountUsd,
        tasa_bcv: p.bcvRate,
        monto_net: p.amountVes,
        monto_iva: 0.0,
        monto_tot: p.amountVes,
        descrip: `Pago Mensualidad (${p.studentFee?.conceptName}) - Alumno: ${student?.firstName} ${student?.lastName} (${student?.grade?.name})`,
      };
    });

    return NextResponse.json({
      success: true,
      tableName: 'saCobro_ProfitPlus',
      count: formattedPayments.length,
      isWeekendBatch: weekendOnly,
      data: formattedPayments,
    });
  } catch (error: any) {
    console.error('Error al generar reporte Profit Plus 2K12:', error);
    return NextResponse.json({ error: 'Error al exportar lote para Profit Plus 2K12' }, { status: 500 });
  }
}
