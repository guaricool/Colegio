'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  GraduationCap, 
  MessageSquare, 
  FileSpreadsheet, 
  Settings, 
  DollarSign, 
  RefreshCw, 
  Award,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [showModalRate, setShowModalRate] = useState(false);
  const [newRateInput, setNewRateInput] = useState('');
  const [rateSource, setRateSource] = useState<string>('');

  const fetchBcv = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch('/api/bcv');
      const data = await res.json();
      if (data.rate) {
        setBcvRate(data.rate);
        setRateSource(data.source || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchBcv();
  }, []);

  const handleSyncAutoBcv = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch('/api/bcv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto: true }),
      });
      const data = await res.json();
      if (data.rate) {
        setBcvRate(data.rate);
        setRateSource(data.source || '');
        setShowModalRate(false);
      } else {
        alert('No se pudo actualizar la tasa automáticamente.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRate(false);
    }
  };

  const handleUpdateRateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRateInput) return;
    try {
      const res = await fetch('/api/bcv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: newRateInput }),
      });
      const data = await res.json();
      if (data.rate) {
        setBcvRate(data.rate);
        setRateSource('MANUAL');
        setShowModalRate(false);
        setNewRateInput('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { label: 'Inicio', href: '/', icon: LayoutDashboard },
    { label: 'Panel Admin', href: '/dashboard', icon: Sparkles },
    { label: 'Portal Padres (Login)', href: '/representante/login', icon: Award },
    { label: 'Cobros y Recibos', href: '/cobros', icon: CreditCard },
    { label: 'Estudiantes', href: '/estudiantes', icon: GraduationCap },
    { label: 'Recordatorios WhatsApp', href: '/whatsapp', icon: MessageSquare },
    { label: 'Reportes Contables', href: '/reportes', icon: FileSpreadsheet },
    { label: 'Configuración', href: '/configuracion', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-emerald-800/30 text-white shadow-2xl">
      {/* Top Banner de Identidad Institucional */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-950 px-4 py-1.5 border-b border-emerald-700/30 text-[11px] text-emerald-200 flex justify-between items-center font-medium">
        <div className="flex items-center space-x-2">
          <Award className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="tracking-wide">
            U.E. Ramón Pierluissi Ramírez — <strong className="text-white">Más de 20 años de Excelencia Educativa</strong> en Valencia, Carabobo
          </span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-emerald-300">
          <span className="flex items-center space-x-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Sede Prebo II</span>
          </span>
          <span>•</span>
          <span>admonpierluissi@gmail.com</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Oficial & Nombre del Colegio */}
          <Link href="/" className="flex items-center space-x-3.5 group py-1">
            <div className="bg-white/95 backdrop-blur px-3 py-1.5 rounded-2xl shadow-xl shadow-emerald-900/20 border border-emerald-400/30 group-hover:scale-105 transition-all">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="U.E. Ramón Pierluissi Ramírez Logo"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-extrabold text-base text-white tracking-tight block leading-tight group-hover:text-emerald-300 transition-colors">
                U.E. Ramón Pierluissi Ramírez
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wide block">
                Sistema de Cobranzas & Gestión Financiera
              </span>
            </div>
          </Link>

          {/* Tasa BCV Badge con Efecto Neon */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-900/90 border border-emerald-600/40 rounded-2xl px-4 py-1.5 flex items-center space-x-2.5 shadow-lg shadow-emerald-900/20">
              <div className="flex items-center text-xs font-black text-amber-400 tracking-wider">
                <DollarSign className="w-3.5 h-3.5 mr-0.5 text-amber-400" />
                TASA BCV:
              </div>
              <span className="font-extrabold text-sm text-gradient-emerald">
                {bcvRate !== null ? `${bcvRate.toFixed(2)} Bs./$` : 'Cargando...'}
              </span>
              <button
                onClick={handleSyncAutoBcv}
                title="Sincronizar automáticamente Tasa Oficial BCV del Banco Central de Venezuela"
                className="p-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white transition-all shadow-md flex items-center space-x-1 hover:scale-105 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRate ? 'animate-spin' : ''}`} />
                <span className="text-[10px] font-extrabold hidden sm:inline">Auto Sync</span>
              </button>
            </div>
          </div>
        </div>

        {/* Links Navigation Bar con Micro-interacciones */}
        <nav className="flex space-x-1.5 overflow-x-auto pb-2.5 pt-1.5 no-scrollbar border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105 border border-emerald-400/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Modal Cambio Tasa BCV */}
      {showModalRate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-700/50 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Tasa Oficial BCV</span>
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Banco Central
              </span>
            </div>
            <p className="text-xs text-slate-400">
              La tasa oficial se obtiene automáticamente del Banco Central de Venezuela o puede ajustarse manualmente.
            </p>

            <div className="p-4 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl flex items-center justify-between shadow-inner">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Sincronización BCV en Vivo:</span>
                <span className="text-base font-extrabold text-emerald-400">
                  {bcvRate ? `${bcvRate.toFixed(2)} Bs./USD` : 'Buscando...'}
                </span>
              </div>
              <button
                onClick={handleSyncAutoBcv}
                disabled={loadingRate}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Obtener de BCV</span>
              </button>
            </div>

            <form onSubmit={handleUpdateRateManual} className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ajuste Manual de Tasa (VES por 1 USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(e.target.value)}
                  placeholder="Ej: 755.15"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModalRate(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition-colors"
                >
                  Guardar Tasa Manual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
