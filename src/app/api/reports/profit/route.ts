import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'clients'; // 'clients' | 'invoices' | 'payments'

    if (type === 'clients') {
      // Exportación de Clientes / Representantes (Estructura saCliente de Profit Plus 2K12)
      const representatives = await prisma.representative.findMany({
        include: { students: true },
      });

      const rows = representatives.map((r) => ({
        co_cli: r.cedula.replace(/[^0-[#]/g, ''),
        cli_des: r.name,
        rif: r.cedula,
        dir: r.address || 'Valencia, Carabobo',
        telefonos: r.phone,
        email: r.email || '',
        co_tipo: 'CONTADO',
        co_zon: 'VALENCIA',
        co_seg: 'COLEGIO',
        inactivo: 0,
      }));

      return NextResponse.json({
        type: 'clients',
        system: 'Profit Plus 2K12',
        tableName: 'saCliente',
        count: rows.length,
        data: rows,
      });
    }

    if (type === 'invoices' || type === 'payments') {
      // Exportación de Cobros y Facturación Fiscal (Estructura saFactura / saCobro de Profit Plus 2K12)
      const payments = await prisma.payment.findMany({
        include: {
          studentFee: {
            include: {
              student: {
                include: {
                  representative: true,
                },
              },
            },
          },
        },
        orderBy: { paymentDate: 'desc' },
      });

      const rows = payments.map((p) => {
        const rep = p.studentFee?.student?.representative;
        return {
          fec_emis: p.paymentDate.toISOString().split('T')[0],
          fact_num: p.receiptNumber,
          co_cli: rep?.cedula.replace(/[^0-9]/g, '') || '000000',
          cli_des: rep?.name || 'Cliente',
          rif: rep?.cedula || 'V-00000000',
          monto_net: p.amountVes,
          monto_usd: p.amountUsd,
          tasa_bcv: p.bcvRate,
          forma_pag: p.method,
          num_ref: p.reference || '',
          descrip: `Cobro Mensualidad - ${p.studentFee?.conceptName} (${p.studentFee?.student?.firstName} ${p.studentFee?.student?.lastName})`,
        };
      });

      return NextResponse.json({
        type: 'payments',
        system: 'Profit Plus 2K12',
        tableName: 'saCobro',
        count: rows.length,
        data: rows,
      });
    }

    return NextResponse.json({ error: 'Tipo de exportación no válido' }, { status: 400 });
  } catch (error: any) {
    console.error('Error en exportador Profit Plus 2K12:', error);
    return NextResponse.json({ error: 'Error al generar datos de Profit Plus 2K12' }, { status: 500 });
  }
}
