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
  Award,
  BookOpen,
  Clock,
  ChevronRight,
  ShieldCheck,
  Building2
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
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Cargando datos contables de U.E. Ramón Pierluissi Ramírez...</p>
        </div>
      </div>
    );
  }

  const { summary, methodSummary, bcvRate } = data;

  return (
    <div className="space-y-8">
      {/* Hero Banner Institucional Pierluissi */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-green-950 border border-emerald-800/50 p-6 sm:p-8 rounded-3xl shadow-2xl">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-0"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Más de 20 Años Formando Líderes con Valores</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              U.E. Ramón Pierluissi Ramírez
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
              Sistema de Cobros & Administración Financiera. Monitoreo multimoneda ($ USD / Bs. VES), emisión de recibos digitalizados y recordatorios automatizados.
            </p>
            <div className="pt-1 flex items-center space-x-4 text-xs font-semibold text-emerald-300">
              <span>Sede Prebo II (Valencia, Carabobo)</span>
              <span>•</span>
              <span>Tasa BCV Oficial: <strong className="text-amber-400 font-extrabold">{bcvRate.toFixed(2)} Bs./$</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-3">
            <Link
              href="/cobros"
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              <span>Registrar Pago & Recibo</span>
            </Link>
            <Link
              href="/whatsapp"
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-800 text-xs font-bold px-5 py-3 rounded-xl transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Recordatorios WhatsApp</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Recaudado */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Ingresos Recaudados</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{formatUsd(summary.totalCollectedUsd)}</div>
          <div className="text-xs font-bold text-emerald-400 mt-1">
            Eqv: {formatVes(summary.totalCollectedVes)}
          </div>
        </div>

        {/* Por Cobrar Total */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Cuentas por Cobrar</span>
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
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Deuda Vencida</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400">{formatUsd(summary.totalOverdueUsd)}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1">
            Eqv: {formatVes(summary.totalOverdueVes)}
          </div>
        </div>

        {/* Eficiencia Recaudación */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-400">Eficiencia Cobros</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400">{summary.collectionEfficiencyPercent}%</div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.collectionEfficiencyPercent)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recaudación por Método de Pago & Matrícula */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Desglose por Método de Pago */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Ingresos por Método de Pago (Pago Móvil & Zelle)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {methodSummary.map((m: any) => {
              const labelMap: Record<string, { title: string; color: string }> = {
                PAGO_MOVIL: { title: 'Pago Móvil Banesco/Mercantil', color: 'from-emerald-600 to-teal-700' },
                ZELLE: { title: 'Zelle (USD)', color: 'from-indigo-600 to-purple-700' },
                TRANSFERENCIA_VES: { title: 'Transferencia Bolívares', color: 'from-blue-600 to-cyan-700' },
                EFECTIVO_USD: { title: 'Efectivo USD', color: 'from-amber-600 to-orange-700' },
                EFECTIVO_VES: { title: 'Efectivo Bolívares', color: 'from-slate-600 to-zinc-700' },
              };
              const meta = labelMap[m.method] || { title: m.method, color: 'from-slate-600 to-slate-800' };

              return (
                <div
                  key={m.method}
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-400 block">{meta.title}</span>
                    <span className="text-lg font-bold text-white block mt-0.5">{formatUsd(m.usd)}</span>
                    <span className="text-xs text-emerald-400 font-medium">{formatVes(m.ves)}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-gradient-to-r ${meta.color}`}>
                    {m.count} {m.count === 1 ? 'pago' : 'pagos'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Matrícula Niveles Académicos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Niveles Académicos Pierluissi</span>
            </h2>

            <div className="space-y-3 mt-4">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-emerald-400 block">Preescolar & Maternal</span>
                <span className="text-slate-400 text-[11px]">Metodología vivencial, ABN y tecnología</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-teal-400 block">Educación Básica (1º a 6º)</span>
                <span className="text-slate-400 text-[11px]">Pensamiento crítico y laboratorios STEAM</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-indigo-400 block">Bachillerato (1º a 5º Año)</span>
                <span className="text-slate-400 text-[11px]">Formación integral con programa SEL</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <Link
              href="/estudiantes"
              className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-colors"
            >
              <span>Ver Matrícula Completa</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Cobros Recientes */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Últimos Cobros Registrados</span>
          </h2>
          <Link href="/cobros" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
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
                const waMessage = `Estimado(a) *${fee.student?.representative?.name}*, le saludamos de la Administración de la *U.E. Ramón Pierluissi Ramírez*. Le recordamos que la mensualidad (${fee.conceptName}) de ${fee.student?.firstName} ${fee.student?.lastName} presenta un saldo pendiente de ${formatUsd(fee.amountUsd - fee.paidUsd)} (Eqv. ${formatVes((fee.amountUsd - fee.paidUsd) * bcvRate)} a Tasa BCV ${bcvRate.toFixed(2)}). Agradecemos reportar su pago vía Pago Móvil o Zelle. ¡Muchas gracias!`;

                return (
                  <tr key={fee.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-200">
                      <div>{fee.student?.firstName} {fee.student?.lastName}</div>
                      <div className="text-[10px] text-emerald-400 font-normal">{fee.student?.grade?.name}</div>
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
