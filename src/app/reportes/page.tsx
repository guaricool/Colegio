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
  Inbox,
  Database,
  CheckCircle2,
  Clock,
  PhoneCall,
  PhoneOff,
  UserCheck,
  Award,
  Activity,
  Check
} from 'lucide-react';
import { formatUsd, formatVes, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/excelExport';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function ReportesPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [callAuditData, setCallAuditData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exportingProfit, setExportingProfit] = useState(false);
  const [activeTab, setActiveTab] = useState<'FINANCIAL' | 'CALLS_AUDIT'>('FINANCIAL');

  const loadReports = async () => {
    setLoading(true);
    try {
      const [repRes, payRes, callsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/payments'),
        fetch('/api/collection-calls'),
      ]);
      const repJson = await repRes.json();
      const payJson = await payRes.json();
      const callsJson = await callsRes.json();

      setReportData(repJson);
      setPayments(payJson);
      setCallAuditData(callsJson);
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

  const handleExportProfitPlus = async (exportType: 'clients' | 'payments', weekendOnly = false) => {
    setExportingProfit(true);
    try {
      const url = `/api/reports/profit?type=${exportType}${weekendOnly ? '&weekendOnly=true' : ''}`;
      const res = await fetch(url);
      const result = await res.json();

      if (res.ok && result.data) {
        if (result.data.length === 0) {
          alert(weekendOnly 
            ? 'No hay cobros registrados durante este fin de semana (sábado y domingo).' 
            : 'No hay registros disponibles para exportar.'
          );
          return;
        }

        const filename = exportType === 'clients' 
          ? 'Profit_Plus_2K12_saCliente_Colegio' 
          : weekendOnly 
            ? 'Profit_Plus_2K12_Lote_FinDeSemana_saCobro'
            : 'Profit_Plus_2K12_saCobro_Colegio';

        exportToExcel(filename, result.tableName || 'ProfitPlus', result.data);
      } else {
        alert('Error al generar los datos para Profit Plus 2K12');
      }
    } catch (e) {
      console.error(e);
      alert('Error en la exportación a Profit Plus 2K12');
    } finally {
      setExportingProfit(false);
    }
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

  const { summary, gradeDebt, bcvRate } = reportData;
  const callStats = callAuditData?.stats || {
    totalCalls: 0,
    contactedCount: 0,
    noAnswerCount: 0,
    convertedCount: 0,
    recoveredUsd: 0,
    conversionRate: 0,
    operators: [],
  };
  const callsList = callAuditData?.calls || [];

  return (
    <AdminAuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-8">
        {/* Header con Pestañas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-emerald-800/30 shadow-2xl">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
              <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
              <span>Reportes Contables & Auditoría de Personal</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Libro de ingresos, exportación Profit Plus 2K12 y métricas de desempeño de cobranza
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-1.5 rounded-2xl flex space-x-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('FINANCIAL')}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === 'FINANCIAL'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Reporte Financiero
            </button>
            <button
              onClick={() => setActiveTab('CALLS_AUDIT')}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === 'CALLS_AUDIT'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📊 Auditoría de Cobranza ({callStats.totalCalls})
            </button>
          </div>
        </div>

        {activeTab === 'FINANCIAL' && (
          <div className="space-y-8">
            {/* Tarjeta Especial de Exportación Profit Plus 2K12 & Lotes del Fin de Semana */}
            <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
                    <Database className="w-3.5 h-3.5" />
                    <span>Integración Contable Fiscal Profit Plus 2K12</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white">
                    Exportador Masivo para Profit Plus 2K12 (Facturación Fiscal)
                  </h2>
                  <p className="text-xs text-slate-300">
                    Genera los archivos masivos compatibles con <strong className="text-white">saCliente</strong> y <strong className="text-white">saCobro</strong> para importar el lunes en Profit Plus 2K12 los cobros registrados el fin de semana.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleExportProfitPlus('payments', true)}
                    disabled={exportingProfit}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-600/30 transition-all hover:scale-105"
                  >
                    <Clock className="w-4 h-4" />
                    <span>📅 Lote Fin de Semana (Sáb/Dom)</span>
                  </button>

                  <button
                    onClick={() => handleExportProfitPlus('clients')}
                    disabled={exportingProfit}
                    className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    <Users className="w-4 h-4" />
                    <span>Clientes (saCliente)</span>
                  </button>
                  <button
                    onClick={() => handleExportProfitPlus('payments', false)}
                    disabled={exportingProfit}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    <span>Todos los Cobros (saCobro)</span>
                  </button>
                </div>
              </div>
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
                <button
                  onClick={handleExportPaymentsExcel}
                  className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-emerald-400 px-3.5 py-2 rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Excel</span>
                </button>
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
        )}

        {/* PESTAÑA: AUDITORÍA Y DESEMPEÑO DEL PERSONAL DE COBRANZA */}
        {activeTab === 'CALLS_AUDIT' && (
          <div className="space-y-8">
            {/* KPIs de Rendimiento de Cobranza */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gestiones Totales</span>
                  <PhoneCall className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">{callStats.totalCalls} llamadas</div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Registradas por el personal</span>
              </div>

              <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contactados con Compromiso</span>
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{callStats.contactedCount} exitosos</div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Representantes atendieron</span>
              </div>

              <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Intentos Fallidos</span>
                  <PhoneOff className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-2xl font-black text-rose-400">{callStats.noAnswerCount} sin respuesta</div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">No contestaron llamadas</span>
              </div>

              <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversión a Pago Real</span>
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-purple-300">
                  {callStats.conversionRate.toFixed(1)}% ({formatUsd(callStats.recoveredUsd)})
                </div>
                <span className="text-[11px] text-slate-400 font-semibold mt-1 block">Dinero recaudado tras gestión</span>
              </div>
            </div>

            {/* Tabla por Operador de Cobranza */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Desempeño y Productividad por Operador (Cajeros)</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Operador / Personal</th>
                      <th className="px-4 py-3.5">Gestiones Totales</th>
                      <th className="px-4 py-3.5">Contactados</th>
                      <th className="px-4 py-3.5">No Contestaron</th>
                      <th className="px-4 py-3.5">Pagos Confirmados</th>
                      <th className="px-4 py-3.5">Monto Recaudado ($)</th>
                      <th className="px-4 py-3.5 text-right">Efectividad %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {callStats.operators.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                          No se han registrado gestiones de llamada por parte del personal de cobranza aún.
                        </td>
                      </tr>
                    ) : (
                      callStats.operators.map((op: any, idx: number) => {
                        const effRate = op.totalCalls > 0 ? (op.converted / op.totalCalls) * 100 : 0;
                        return (
                          <tr key={idx} className="table-row-hover">
                            <td className="px-4 py-3.5 font-bold text-white flex items-center space-x-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                              <span>{op.operatorName}</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono font-bold text-slate-200">{op.totalCalls}</td>
                            <td className="px-4 py-3.5 text-emerald-400 font-bold">{op.contacted}</td>
                            <td className="px-4 py-3.5 text-rose-400 font-bold">{op.noAnswer}</td>
                            <td className="px-4 py-3.5 text-purple-400 font-black">{op.converted}</td>
                            <td className="px-4 py-3.5 font-black text-emerald-400">{formatUsd(op.recoveredUsd)}</td>
                            <td className="px-4 py-3.5 text-right">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                                {effRate.toFixed(1)}% Efectividad
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Historial Detallado Auditante de Gestiones (Cruce con Pago) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-purple-400" />
                <span>Línea de Tiempo Auditante (Cruce de Llamada ➔ Pago Confirmado)</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3.5">Fecha & Hora</th>
                      <th className="px-4 py-3.5">Operador</th>
                      <th className="px-4 py-3.5">Estudiante & Grado</th>
                      <th className="px-4 py-3.5">Representante</th>
                      <th className="px-4 py-3.5">Resultado Gestión</th>
                      <th className="px-4 py-3.5">Observación / Compromiso</th>
                      <th className="px-4 py-3.5 text-right">Cruce de Pago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {callsList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500 space-y-2">
                          <Inbox className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                          <div className="font-semibold text-slate-400">No hay eventos de cobranza registrados</div>
                          <div className="text-[11px] text-slate-500">Utiliza el botón &quot;Gestión Llamada&quot; en la sección de Cobros para iniciar el seguimiento.</div>
                        </td>
                      </tr>
                    ) : (
                      callsList.map((c: any) => {
                        const isConverted = c.result === 'CONVERTED_PAID' || c.studentFee?.status === 'PAID';

                        return (
                          <tr key={c.id} className="table-row-hover">
                            <td className="px-4 py-3.5 text-slate-400 font-mono">{formatDate(c.createdAt)}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-200">{c.operatorName}</td>
                            <td className="px-4 py-3.5 text-slate-300 font-semibold">
                              <div>{c.studentFee?.student?.firstName} {c.studentFee?.student?.lastName}</div>
                              <div className="text-[10px] text-indigo-400">{c.studentFee?.student?.grade?.name}</div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-300">
                              <div>{c.studentFee?.student?.representative?.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{c.studentFee?.student?.representative?.phone}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              {c.status === 'CONTACTED' ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <UserCheck className="w-3 h-3" />
                                  <span>COMUNICADO</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  <PhoneOff className="w-3 h-3" />
                                  <span>NO CONTESTÓ</span>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-slate-300 max-w-xs truncate font-medium">
                              {c.notes || 'Sin observaciones'}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {isConverted ? (
                                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                                  <Check className="w-3 h-3" />
                                  <span>PAGO REALIZADO</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  PENDIENTE
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminAuthGuard>
  );
}
