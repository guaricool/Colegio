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
  BookOpen
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [bcvRate, setBcvRate] = useState<number | null>(null);
  const [loadingRate, setLoadingRate] = useState(false);
  const [showModalRate, setShowModalRate] = useState(false);
  const [newRateInput, setNewRateInput] = useState('');

  const fetchBcv = async () => {
    setLoadingRate(true);
    try {
      const res = await fetch('/api/bcv');
      const data = await res.json();
      if (data.rate) {
        setBcvRate(data.rate);
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

  const handleUpdateRate = async (e: React.FormEvent) => {
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
        setShowModalRate(false);
        setNewRateInput('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Cobros y Recibos', href: '/cobros', icon: CreditCard },
    { label: 'Estudiantes', href: '/estudiantes', icon: GraduationCap },
    { label: 'Recordatorios WhatsApp', href: '/whatsapp', icon: MessageSquare },
    { label: 'Reportes Contables', href: '/reportes', icon: FileSpreadsheet },
    { label: 'Configuración', href: '/configuracion', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-emerald-900/40 text-white shadow-2xl">
      {/* Top Banner de Identidad Institucional */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-slate-900 px-4 py-1 border-b border-emerald-800/40 text-[11px] text-emerald-200 flex justify-between items-center font-medium">
        <div className="flex items-center space-x-2">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>U.E. Ramón Pierluissi Ramírez — Más de 20 años de Excelencia Educativa en Valencia, Carabobo</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-emerald-300">
          <span>Sede Prebo II</span>
          <span>•</span>
          <span>admonpierluissi@gmail.com</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Colegio Name */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg text-white tracking-tight block leading-tight">
                U.E. Ramón Pierluissi Ramírez
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold tracking-wide">
                Sistema de Cobranzas & Gestión Financiera
              </span>
            </div>
          </Link>

          {/* Tasa BCV Badge */}
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-950/80 border border-emerald-800/80 rounded-xl px-3.5 py-1.5 flex items-center space-x-2 shadow-inner">
              <div className="flex items-center text-xs font-bold text-amber-400">
                <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                TASA BCV:
              </div>
              <span className="font-bold text-sm text-white">
                {bcvRate !== null ? `${bcvRate.toFixed(2)} Bs./$` : 'Cargando...'}
              </span>
              <button
                onClick={() => {
                  setNewRateInput(bcvRate ? bcvRate.toString() : '');
                  setShowModalRate(true);
                }}
                title="Actualizar Tasa BCV Oficial"
                className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-300 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingRate ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Links Navigation Bar */}
        <nav className="flex space-x-1 overflow-x-auto pb-2 pt-1 no-scrollbar border-t border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Modal Cambio Tasa BCV */}
      {showModalRate && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-800/80 rounded-2xl p-6 w-full max-w-md shadow-2xl text-white">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Actualizar Tasa BCV Oficial</h3>
            <p className="text-xs text-slate-400 mb-4">
              Ajuste de la tasa de cambio del Banco Central de Venezuela aplicable a todos los recibos y mensualidades de la institución.
            </p>
            <form onSubmit={handleUpdateRate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tasa Oficial en Bolívares (VES por 1 USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(e.target.value)}
                  placeholder="Ej: 105.80"
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
                  Guardar Tasa BCV
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
