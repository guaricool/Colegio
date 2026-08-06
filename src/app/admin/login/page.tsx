'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Mail, Lock, LogIn, Sparkles, Building2, UserPlus } from 'lucide-react';

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        localStorage.setItem('pierluissi_admin_session', JSON.stringify(data.user));

        if (data.user.role === 'COBRANZA') {
          router.push('/cobros');
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(data.error || 'Credenciales inválidas');
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Acceso Personal Administrativo & Cobranza</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            U.E. Ramón Pierluissi Ramírez
          </h1>
          <p className="text-xs text-slate-300">
            Inicie sesión con su usuario, correo y contraseña de administración
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-2xl text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico o Usuario
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="cpierluissis@gmail.com o usuario"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Verificando...' : 'Iniciar Sesión Administrativa'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <Link href="/admin/register" className="text-emerald-400 hover:text-emerald-300 font-extrabold flex items-center space-x-1">
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registrar Nuevo Usuario</span>
          </Link>
          <Link href="/" className="text-slate-500 hover:text-slate-300 font-semibold">
            Ir al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
