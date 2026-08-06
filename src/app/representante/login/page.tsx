'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ShieldCheck, ArrowRight, UserCheck, Sparkles, Building2 } from 'lucide-react';

export default function RepresentanteLoginPage() {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/representatives/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cedula }),
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar sesión en localStorage para persistencia rápida en teléfono
        localStorage.setItem('pierluissi_rep_session', JSON.stringify(data));
        router.push('/representante/portal');
      } else {
        setError(data.error || 'No se pudo iniciar sesión. Verifique su número de cédula.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-emerald-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl glass-panel relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Header institucional */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/30 mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            Portal de Representantes
          </h1>
          <p className="text-xs text-emerald-400 font-extrabold uppercase tracking-wider">
            U.E. Ramón Pierluissi Ramírez
          </p>
          <p className="text-xs text-slate-300">
            Consulte su estado de cuenta y reporte sus pagos vía Pago Móvil o Zelle de forma inmediata.
          </p>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center space-x-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Cédula del Representante</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ej: V-15.420.198 o 15420198"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-semibold"
            />
            <span className="text-[11px] text-slate-300 mt-1 block">
              Ingrese el número de cédula registrado en la matrícula escolar del estudiante.
            </span>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3 rounded-xl font-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 text-xs hover:scale-105"
          >
            <span>{loading ? 'Verificando...' : 'Ingresar al Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Info adicional sin tarjeta */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Pago Móvil & Zelle Directo</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            No requiere ingresar tarjetas de crédito ni datos bancarios sensibles. Solo efectúe su transferencia y registre la referencia para obtener su recibo en PDF al instante.
          </p>
        </div>
      </div>
    </div>
  );
}
