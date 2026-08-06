'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  Euro, 
  Users, 
  GraduationCap, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles,
  Building2,
  Calendar,
  PhoneCall,
  Download,
  ShieldCheck
} from 'lucide-react';
import { formatUsd, formatVes, formatDate } from '@/lib/utils';
import { FeeStatusBadge } from '@/components/FeeStatusBadge';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <AdminAuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="space-y-8">
        {/* Banner de Bienvenida Institucional */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/50 p-6 rounded-3xl border border-emerald-800/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gestión Financiera Escolar</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              U.E. Ramón Pierluissi Ramírez
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Panel de control de mensualidades, auditoría de flujo de caja, cobranza y facturación fiscal para Profit Plus 2K12
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/cobros"
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              <span>Registrar Cobro</span>
            </Link>
            <Link
              href="/reportes"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all"
            >
              <Download className="w-4 h-4 text-purple-400" />
              <span>Profit Plus 2K12</span>
            </Link>
          </div>
        </div>

        {loading || !data ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-300">Cargando métricas financieras del colegio...</p>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards Principal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/90 border border-emerald-800/40 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Recaudado</span>
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-emerald-400">
                    {formatUsd(data.summary?.totalCollectedUsd || 0)}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    {formatVes(data.summary?.totalCollectedVes || 0)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-amber-800/40 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Cuentas por Cobrar</span>
                  <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-amber-400">
                    {formatUsd(data.summary?.totalPendingUsd || 0)}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    {formatVes(data.summary?.totalPendingVes || 0)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-rose-800/40 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Morosidad Vencida</span>
                  <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-rose-400">
                    {formatUsd(data.summary?.totalOverdueUsd || 0)}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 mt-0.5">
                    {formatVes(data.summary?.totalOverdueVes || 0)}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-indigo-800/40 rounded-2xl p-5 shadow-xl glass-card-hover">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Estudiantes Inscritos</span>
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-black text-white">
                    {data.summary?.studentCount || 0}
                  </div>
                  <div className="text-xs font-semibold text-indigo-400 mt-0.5">
                    {data.summary?.representativeCount || 0} Representantes
                  </div>
                </div>
              </div>
            </div>

            {/* Accesos Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/cobros" className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-emerald-500/50 transition-all group shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <h3 className="text-sm font-extrabold text-white mt-4">Gestión de Cobros & Recibos</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Registrar mensualidades, abonos con Pago Móvil, C2P, Zelle o efectivo y generar PDF.
                </p>
              </Link>

              <Link href="/estudiantes" className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 transition-all group shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <h3 className="text-sm font-extrabold text-white mt-4">Estudiantes & Grados</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Registro de alumnos, asignación de porcentaje de becas y facturación masiva mensual.
                </p>
              </Link>

              <Link href="/whatsapp" className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl hover:border-teal-500/50 transition-all group shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-teal-500/10 rounded-2xl text-teal-400 group-hover:scale-110 transition-transform">
                    <PhoneCall className="w-6 h-6" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400" />
                </div>
                <h3 className="text-sm font-extrabold text-white mt-4">Recordatorios WhatsApp</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Notificaciones automáticas con enlace wa.me para recordar pagos a representantes.
                </p>
              </Link>
            </div>
          </>
        )}
      </div>
    </AdminAuthGuard>
  );
}
