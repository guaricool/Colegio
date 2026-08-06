'use client';

import React, { useEffect, useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Users, 
  Calendar,
  FileText,
  Sparkles,
  Inbox
} from 'lucide-react';
import { formatUsd, formatVes, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/excelExport';

export default function ReportesPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const [repRes, payRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/payments'),
      ]);
      const repJson = await repRes.json();
      const payJson = await payRes.json();

      setReportData(repJson);
      setPayments(payJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleExportPaymentsExcel = () => {
    if (!payments.length) {
      alert('No hay registros de ingresos para exportar a Excel en este momento.');
      return;
    }
    const formattedData = payments.map((p) => ({
      Recibo: p.receiptNumber,
      Fecha: formatDate(p.paymentDate),
      Estudiante: `${p.studentFee?.student?.firstName} ${p.studentFee?.student?.lastName}`,
      Grado: `${p.studentFee?.student?.grade?.name} (${p.studentFee?.student?.grade?.section})`,
      Representante: p.studentFee?.student?.representative?.name,
      Concepto: p.studentFee?.conceptName,
      Método: p.method,
      Referencia: p.reference || 'N/A',
      'Monto USD ($)': p.amountUsd,
      'Monto VES (Bs)': p.amountVes,
      'Tasa BCV': p.bcvRate,
    }));

    exportToExcel('Libro_Ingresos_Colegio_Ramon_Pierluissi', 'Ingresos', formattedData);
  };

  if (loading || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300">Generando reportes contables de U.E. Ramón Pierluissi Ramírez...</p>
        </div>
      </div>
    );
  }

  const { summary, methodSummary, gradeDebt, bcvRate } = reportData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 p-6 rounded-3xl border border-emerald-800/30 shadow-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
            <span>Reportes Contables & Auditoría de Ingresos</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Libro de ingresos, auditoría de flujo de caja, estado de morosidad y exportación oficial a Excel
          </p>
        </div>

        <button
          onClick={handleExportPaymentsExcel}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Libro de Ingresos a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-emerald-800/40 rounded-2xl p-5 shadow-xl glass-card-hover">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Recaudado</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{formatUsd(summary.totalCollectedUsd)}</div>
          <span className="text-xs text-slate-400 mt-0.5 block font-semibold">{formatVes(summary.totalCollectedVes)}</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-800/40 rounded-2xl p-5 shadow-xl glass-card-hover">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Cuentas por Cobrar</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{formatUsd(summary.totalPendingUsd)}</div>
          <span className="text-xs text-slate-400 mt-0.5 block font-semibold">{formatVes(summary.totalPendingVes)}</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-800/40 rounded-2xl p-5 shadow-xl glass-card-hover">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Morosidad Vencida</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{formatUsd(summary.totalOverdueUsd)}</div>
          <span className="text-xs text-slate-400 mt-0.5 block font-semibold">{formatVes(summary.totalOverdueVes)}</span>
        </div>
      </div>

      {/* Resumen por Grado */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span>Morosidad y Cuentas por Cobrar por Grado Escolar</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradeDebt.length === 0 ? (
            <div className="col-span-full py-6 text-center text-slate-500 text-xs font-medium">
              No hay cuentas por cobrar registradas en ningún grado actualmente.
            </div>
          ) : (
            gradeDebt.map((g: any, idx: number) => (
              <div key={idx} className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1 shadow-inner">
                <span className="text-xs font-bold text-indigo-400 block">{g.gradeName} ({g.section})</span>
                <div className="text-lg font-black text-amber-400">{formatUsd(g.pendingUsd)}</div>
                <span className="text-[11px] text-slate-400 block font-semibold">{formatVes(g.pendingUsd * bcvRate)} adeudados</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Libro de Ingresos Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Libro de Ingresos & Flujo de Caja (Auditoría)</span>
          </h2>
          <span className="text-xs text-slate-300 font-bold bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            Pagos Registrados: <strong className="text-emerald-400 font-extrabold">{payments.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">N° Recibo</th>
                <th className="px-4 py-3.5">Fecha</th>
                <th className="px-4 py-3.5">Estudiante & Grado</th>
                <th className="px-4 py-3.5">Concepto</th>
                <th className="px-4 py-3.5">Método</th>
                <th className="px-4 py-3.5">Referencia</th>
                <th className="px-4 py-3.5">Monto ($)</th>
                <th className="px-4 py-3.5">Monto (VES)</th>
                <th className="px-4 py-3.5">Tasa BCV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-500 space-y-2">
                    <Inbox className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                    <div className="font-semibold text-slate-400">El libro de ingresos está vacío en este momento</div>
                    <div className="text-[11px] text-slate-500">A medida que registres cobros de mensualidades, se generará la auditoría automática aquí.</div>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="table-row-hover">
                    <td className="px-4 py-3.5 font-black text-emerald-400">{p.receiptNumber}</td>
                    <td className="px-4 py-3.5 text-slate-400">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-200">
                      <div>{p.studentFee?.student?.firstName} {p.studentFee?.student?.lastName}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.studentFee?.student?.grade?.name} ({p.studentFee?.student?.grade?.section})
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 font-semibold">{p.studentFee?.conceptName}</td>
                    <td className="px-4 py-3.5 text-slate-300 font-bold">{p.method}</td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">{p.reference || 'N/A'}</td>
                    <td className="px-4 py-3.5 font-black text-white">{formatUsd(p.amountUsd)}</td>
                    <td className="px-4 py-3.5 font-extrabold text-emerald-400">{formatVes(p.amountVes)}</td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">{p.bcvRate.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
