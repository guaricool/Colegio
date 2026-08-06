'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  GraduationCap, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  BookOpen, 
  Award,
  CreditCard,
  MessageSquare,
  Users,
  Lock,
  ChevronRight,
  PhoneCall,
  MapPin
} from 'lucide-react';
import { formatVes } from '@/lib/utils';

export default function LandingPage() {
  const [bcvRate, setBcvRate] = useState<number>(755.15);

  useEffect(() => {
    fetch('/api/bcv')
      .then((res) => res.json())
      .then((data) => {
        if (data.rate) setBcvRate(data.rate);
      })
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section Institucional */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-800/40 p-8 sm:p-12 rounded-3xl shadow-2xl glass-panel">
        <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="absolute left-10 bottom-0 w-80 h-80 bg-teal-500/10 rounded-full blur-2xl -z-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Excelencia Educativa en Valencia, Carabobo</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Unidad Educativa <br />
            <span className="text-gradient-emerald">Ramón Pierluissi Ramírez</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Formando líderes integrales con valores, excelencia académica e innovación tecnológica en un ambiente seguro, seguro y estructurado.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center space-x-2 bg-slate-950/80 border border-emerald-500/30 px-4 py-2 rounded-2xl text-xs font-extrabold text-white">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <span>Tasa Oficial BCV del Día: <strong className="text-amber-400">{bcvRate.toFixed(2)} Bs./$</strong></span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl text-xs text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Sede Prebo II</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DOBLE PORTAL DE ACCESO (Padres vs Administración) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Portales de Acceso al Sistema
          </h2>
          <p className="text-xs text-slate-400">
            Seleccione la opción correspondiente según su perfil para ingresar a la plataforma de cobros y administración.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Portal de Padres & Representantes */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-700/40 rounded-3xl p-8 shadow-2xl glass-card-hover flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xl shadow-emerald-600/30">
                <UserCheck className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block">
                  Para Padres y Representantes
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Portal de Representantes (Pago Sin Tarjeta)
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Consulte su estado de cuenta en USD y Bolívares a la Tasa BCV del día. Reporte sus transferencias de <strong>Pago Móvil o Zelle</strong> ingresando únicamente el número de referencia y obtenga su recibo formal en PDF de inmediato.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Acceso simplificado con su Cédula de Identidad</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sin solicitar datos de tarjeta de crédito/débito</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Descarga directa de recibos digitalizados</span>
                </li>
              </ul>
            </div>

            <Link
              href="/representante/login"
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 text-xs hover:scale-105"
            >
              <span>Ingresar al Portal de Padres</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Portal Administrativo */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-8 shadow-2xl glass-card-hover flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/30">
                <Building2 className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider block">
                  Para Administración y Directiva
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">
                  Portal Administrativo & Financiero
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Panel de control para la gestión de mensualidades escolares, cobros asistidos, envío masivo de recordatorios por WhatsApp, auditoría de flujo de caja y exportación a Excel.
              </p>

              <ul className="space-y-2 text-xs text-slate-300 font-medium">
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Control de cuotas, becas y descuentos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Recordatorios automatizados por WhatsApp</span>
                </li>
                <li className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>Libro de ingresos y auditoría contable</span>
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-extrabold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center space-x-2 text-xs hover:scale-105"
            >
              <span>Acceso Administrativo</span>
              <Lock className="w-4 h-4 text-indigo-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Niveles Educativos */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-emerald-400" />
              <span>Niveles Académicos Institucionales</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Programa de formación integral diseñado para cada etapa de desarrollo del estudiante.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-emerald-400 block">Maternal & Preescolar</span>
            <h4 className="text-sm font-black text-white">Educación Inicial</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Metodología vivencial, desarrollo psicomotor, ABN y primera aproximación tecnológica en aulas adaptadas.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-teal-400 block">1º a 6º Grado</span>
            <h4 className="text-sm font-black text-white">Educación Primaria</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Consolidación del pensamiento lógico-matemático, expresión oral/escrita y laboratorios prácticos STEAM.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-indigo-400 block">1º a 3º Año</span>
            <h4 className="text-sm font-black text-white">Media General</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Profundización científica, razonamiento cuantitativo y programas de educación socioemocional SEL.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 p-5 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-purple-400 block">4º y 5º Año</span>
            <h4 className="text-sm font-black text-white">Diversificado</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Orientación vocacional universitaria, proyectos de desarrollo comunitario y liderazgo ejecutivo.
            </p>
          </div>
        </div>
      </section>

      {/* Ubicación y Contacto */}
      <footer className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
        <div className="space-y-1 text-center md:text-left">
          <div className="font-heading font-extrabold text-base text-white">
            U.E. Ramón Pierluissi Ramírez
          </div>
          <p>Sede Prebo II, Valencia, Estado Carabobo, Venezuela.</p>
          <p className="text-emerald-400 font-semibold">RIF: J-31489201-4 | Código DEA: S3489D0804</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
          <div className="flex items-center space-x-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>+58 414-7890123</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
