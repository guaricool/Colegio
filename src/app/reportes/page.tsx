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
  FileText
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
    if (!payments.length) return;
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
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Generando reportes de contabilidad...</p>
        </div>
      </div>
    );
  }

  const { summary, methodSummary, gradeDebt, bcvRate } = reportData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
            <span>Reportes Contables y Financieros</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Libro de ingresos, auditoría de flujo de caja, estado de cuentas por cobrar y exportación a Excel
          </p>
        </div>

        <button
          onClick={handleExportPaymentsExcel}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Libro de Ingresos a Excel (.xlsx)</span>
        </button>
      </div>

      {/* Summary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Recaudado</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{formatUsd(summary.totalCollectedUsd)}</div>
          <span className="text-xs text-slate-400 mt-0.5 block">{formatVes(summary.totalCollectedVes)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Total Cuentas por Cobrar</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{formatUsd(summary.totalPendingUsd)}</div>
          <span className="text-xs text-slate-400 mt-0.5 block">{formatVes(summary.totalPendingVes)}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Morosidad Vencida</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{formatUsd(summary.totalOverdueUsd)}</div>
          <span className="text-xs text-slate-400 mt-0.5 block">{formatVes(summary.totalOverdueVes)}</span>
        </div>
      </div>

      {/* Resumen por Grado */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <span>Morosidad y Cuentas por Cobrar por Grado Escolar</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {gradeDebt.map((g: any, idx: number) => (
            <div key={idx} className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-xs font-bold text-indigo-400 block">{g.gradeName} ({g.section})</span>
              <div className="text-lg font-extrabold text-amber-400">{formatUsd(g.pendingUsd)}</div>
              <span className="text-[11px] text-slate-400 block">{formatVes(g.pendingUsd * bcvRate)} adeudados</span>
            </div>
          ))}
        </div>
      </div>

      {/* Libro de Ingresos Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <span>Libro de Ingresos y Flujo de Caja (Auditoría)</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">Registros: {payments.length}</span>
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
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3.5 font-bold text-blue-400">{p.receiptNumber}</td>
                  <td className="px-4 py-3.5 text-slate-400">{formatDate(p.paymentDate)}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-200">
                    <div>{p.studentFee?.student?.firstName} {p.studentFee?.student?.lastName}</div>
                    <div className="text-[10px] text-slate-500">
                      {p.studentFee?.student?.grade?.name} ({p.studentFee?.student?.grade?.section})
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">{p.studentFee?.conceptName}</td>
                  <td className="px-4 py-3.5 text-slate-300 font-semibold">{p.method}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono">{p.reference || 'N/A'}</td>
                  <td className="px-4 py-3.5 font-bold text-white">{formatUsd(p.amountUsd)}</td>
                  <td className="px-4 py-3.5 font-bold text-emerald-400">{formatVes(p.amountVes)}</td>
                  <td className="px-4 py-3.5 text-slate-400">{p.bcvRate.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
