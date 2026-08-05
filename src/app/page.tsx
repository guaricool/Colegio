'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  MessageSquare, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';
import { formatUsd, formatVes, formatDate, buildWhatsappLink } from '@/lib/utils';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentFees, setRecentFees] = useState<any[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsRes, feesRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/fees'),
      ]);
      const reportsJson = await reportsRes.json();
      const feesJson = await feesRes.json();

      setData(reportsJson);
      setRecentFees(feesJson.slice(0, 5));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Cargando panel financiero...</p>
        </div>
      </div>
    );
  }

  const { summary, methodSummary, bcvRate } = data;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Panel de Control Financiero
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Resumen contable y estado de cobranzas en tiempo real (Tasa BCV: <span className="text-emerald-400 font-semibold">{bcvRate.toFixed(2)} Bs./$</span>)
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/cobros"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            <CreditCard className="w-4 h-4" />
            <span>Registrar Pago</span>
          </Link>
          <Link
            href="/whatsapp"
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Recordatorios WhatsApp</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudado */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase">Ingresos Recaudados</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatUsd(summary.totalCollectedUsd)}</div>
          <div className="text-xs font-semibold text-emerald-400 mt-1">
            Eqv: {formatVes(summary.totalCollectedVes)}
          </div>
        </div>

        {/* Por Cobrar / Pendiente */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase">Por Cobrar Total</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400">{formatUsd(summary.totalPendingUsd)}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">
            Eqv: {formatVes(summary.totalPendingVes)}
          </div>
        </div>

        {/* Morosidad Vencida */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase">Deuda Vencida</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">{formatUsd(summary.totalOverdueUsd)}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">
            Eqv: {formatVes(summary.totalOverdueVes)}
          </div>
        </div>

        {/* Efectividad de Cobro */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold tracking-wider uppercase">Eficiencia Recaudación</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400">{summary.collectionEfficiencyPercent}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.collectionEfficiencyPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recaudación por Método de Pago & Accesos Rápido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desglose por Método de Pago */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            <span>Ingresos por Método de Pago (Venezuela & Zelle)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methodSummary.map((m: any) => {
              const labelMap: Record<string, { title: string; color: string }> = {
                PAGO_MOVIL: { title: 'Pago Móvil', color: 'from-emerald-500 to-teal-600' },
                ZELLE: { title: 'Zelle (USD)', color: 'from-purple-500 to-indigo-600' },
                TRANSFERENCIA_VES: { title: 'Transferencia VES', color: 'from-blue-500 to-cyan-600' },
                EFECTIVO_USD: { title: 'Efectivo USD', color: 'from-amber-500 to-orange-600' },
                EFECTIVO_VES: { title: 'Efectivo VES', color: 'from-slate-500 to-zinc-600' },
              };
              const meta = labelMap[m.method] || { title: m.method, color: 'from-slate-500 to-slate-700' };

              return (
                <div
                  key={m.method}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block">{meta.title}</span>
                    <span className="text-lg font-bold text-white block mt-0.5">{formatUsd(m.usd)}</span>
                    <span className="text-xs text-slate-400">{formatVes(m.ves)}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${meta.color}`}>
                    {m.count} {m.count === 1 ? 'pago' : 'pagos'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Acceso Rápido / Stats Alumnos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>Matrícula Escolar</span>
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs font-medium text-slate-300">Estudiantes Registrados</span>
                <span className="text-base font-bold text-white">{summary.totalStudentsCount}</span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-xs font-medium text-slate-300">Representantes</span>
                <span className="text-base font-bold text-white">{summary.totalRepresentativesCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <Link
              href="/estudiantes"
              className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              <span>Ver Listado Completo</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cobros Recientes & Estado de Mensualidades */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Últimos Cobros Registrados</span>
          </h2>
          <Link href="/cobros" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            Ver Todos →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 rounded-l-xl">Estudiante</th>
                <th className="px-4 py-3">Concepto</th>
                <th className="px-4 py-3">Monto ($)</th>
                <th className="px-4 py-3">Vencimiento</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 rounded-r-xl text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentFees.map((fee: any) => {
                const isOverdue = fee.status === 'OVERDUE';
                const isPaid = fee.status === 'PAID';
                const isPartial = fee.status === 'PARTIAL';

                const repPhone = fee.student?.representative?.phone || '';
                const waMessage = `Estimado(a) ${fee.student?.representative?.name}, le recordamos desde el Colegio Ramón Pierluissi que la mensualidad (${fee.conceptName}) de ${fee.student?.firstName} ${fee.student?.lastName} presenta un saldo pendiente de ${formatUsd(fee.amountUsd - fee.paidUsd)} (Eqv. ${formatVes((fee.amountUsd - fee.paidUsd) * bcvRate)} a Tasa BCV ${bcvRate.toFixed(2)}). Agradecemos reportar su pago.`;

                return (
                  <tr key={fee.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-slate-200">
                      <div>{fee.student?.firstName} {fee.student?.lastName}</div>
                      <div className="text-[10px] text-slate-400">{fee.student?.grade?.name} ({fee.student?.grade?.section})</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300">{fee.conceptName}</td>
                    <td className="px-4 py-3.5 font-bold text-white">{formatUsd(fee.amountUsd)}</td>
                    <td className="px-4 py-3.5 text-slate-400">{formatDate(fee.dueDate)}</td>
                    <td className="px-4 py-3.5">
                      {isPaid && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          PAGADO
                        </span>
                      )}
                      {isOverdue && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          VENCIDO
                        </span>
                      )}
                      {isPartial && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          ABONADO
                        </span>
                      )}
                      {!isPaid && !isOverdue && !isPartial && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          PENDIENTE
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      {!isPaid && repPhone && (
                        <a
                          href={buildWhatsappLink(repPhone, waMessage)}
                          target="_blank"
                          rel="noreferrer"
                          title="Enviar aviso por WhatsApp"
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
