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
  Euro,
  RefreshCw, 
  Award,
  Zap,
  Sparkles,
  Lock,
  UserCheck,
  Home
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [bcvUsd, setBcvUsd] = useState<number | null>(null);
  const [bcvEur, setBcvEur] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [showModalRate, setShowModalRate] = useState(false);
  const [newUsdInput, setNewUsdInput] = useState('');
  const [newEurInput, setNewEurInput] = useState('');

  const fetchBcv = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch('/api/bcv');
      const data = await res.json();
      if (data.usdRate || data.rate) {
        setBcvUsd(data.usdRate || data.rate);
        setBcvEur(data.eurRate || (data.rate * 1.08));
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
      if (data.usdRate || data.rate) {
        setBcvUsd(data.usdRate || data.rate);
        setBcvEur(data.eurRate || (data.rate * 1.08));
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
    if (!newUsdInput) return;
    try {
      const res = await fetch('/api/bcv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: newUsdInput, eurRate: newEurInput }),
      });
      const data = await res.json();
      if (data.usdRate || data.rate) {
        setBcvUsd(data.usdRate || data.rate);
        setBcvEur(data.eurRate || (data.rate * 1.08));
        setShowModalRate(false);
        setNewUsdInput('');
        setNewEurInput('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isLandingPage = pathname === '/';
  const isParentPortal = pathname.startsWith('/representante');
  const isAdminArea = !isLandingPage && !isParentPortal;

  const adminNavItems = [
    { label: 'Dashboard Admin', href: '/dashboard', icon: LayoutDashboard },
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
                {isAdminArea ? 'Panel de Gestión Administrativa' : isParentPortal ? 'Portal de Representantes' : 'Plataforma Institucional'}
              </span>
            </div>
          </Link>

          {/* Tasa BCV Dual (USD & EUR) Badges */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="bg-slate-900/90 border border-emerald-600/40 rounded-2xl px-3 py-1.5 flex items-center space-x-3 shadow-lg shadow-emerald-900/20">
              {/* USD */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="font-black text-amber-400 flex items-center">
                  <DollarSign className="w-3.5 h-3.5 mr-0.5 text-amber-400" />
                  USD:
                </span>
                <span className="font-extrabold text-emerald-400 text-xs sm:text-sm">
                  {bcvUsd !== null ? `${bcvUsd.toFixed(2)}` : '...'}
                </span>
              </div>

              <div className="h-4 w-px bg-slate-800"></div>

              {/* EUR */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="font-black text-blue-400 flex items-center">
                  <Euro className="w-3.5 h-3.5 mr-0.5 text-blue-400" />
                  EUR:
                </span>
                <span className="font-extrabold text-blue-300 text-xs sm:text-sm">
                  {bcvEur !== null ? `${bcvEur.toFixed(2)}` : '...'}
                </span>
              </div>

              <button
                onClick={handleSyncAutoBcv}
                title="Sincronizar automáticamente Tasa Oficial BCV (USD/EUR)"
                className="p-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white transition-all shadow-md flex items-center hover:scale-105"
              >
                <RefreshCw className={`w-3 h-3 ${loadingRate ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Acceso directo si se está en la Landing Page */}
            {isLandingPage && (
              <div className="flex items-center space-x-2">
                <Link
                  href="/representante/login"
                  className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Portal Padres</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Admin</span>
                </Link>
              </div>
            )}

            {/* Botón Inicio si se está en el portal de padres o admin */}
            {!isLandingPage && (
              <Link
                href="/"
                className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
              >
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Inicio</span>
              </Link>
            )}
          </div>
        </div>

        {/* Solo se muestran los menús administrativos si se está en una ruta administrativa */}
        {isAdminArea && (
          <nav className="flex space-x-1.5 overflow-x-auto pb-2.5 pt-1.5 no-scrollbar border-t border-slate-800/80">
            {adminNavItems.map((item) => {
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
        )}
      </div>

      {/* Modal Cambio Tasa BCV */}
      {showModalRate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-700/50 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <span>Tasas Oficiales BCV (USD & EUR)</span>
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Banco Central
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Las tasas oficiales se obtienen automáticamente del Banco Central de Venezuela (Dólares y Euros) o pueden ajustarse manualmente.
            </p>

            <div className="p-4 bg-emerald-950/80 border border-emerald-800/80 rounded-2xl flex items-center justify-between shadow-inner">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 block font-medium">Sincronización BCV en Vivo:</span>
                <div className="text-sm font-extrabold text-emerald-400 flex items-center space-x-3">
                  <span>USD: {bcvUsd ? `${bcvUsd.toFixed(2)} Bs.` : '...'}</span>
                  <span className="text-blue-400">EUR: {bcvEur ? `${bcvEur.toFixed(2)} Bs.` : '...'}</span>
                </div>
              </div>
              <button
                onClick={handleSyncAutoBcv}
                disabled={loadingRate}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Obtener BCV</span>
              </button>
            </div>

            <form onSubmit={handleUpdateRateManual} className="space-y-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ajuste Manual Tasa USD (VES por 1 USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newUsdInput}
                  onChange={(e) => setNewUsdInput(e.target.value)}
                  placeholder="Ej: 75.51"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ajuste Manual Tasa EUR (VES por 1 EUR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newEurInput}
                  onChange={(e) => setNewEurInput(e.target.value)}
                  placeholder="Ej: 81.20"
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
                  Guardar Tasas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
