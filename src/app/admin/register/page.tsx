'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, ShieldCheck, Sparkles } from 'lucide-react';

export default function AdminRegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          firstName,
          lastName,
          password,
          role,
        }),
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
        setError(data.error || 'Error al registrar el usuario');
      }
    } catch (err) {
      console.error(err);
      setError('Error de comunicación con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <UserPlus className="w-4 h-4" />
            <span>Registro de Usuario Administrativo</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            U.E. Ramón Pierluissi Ramírez
          </h1>
          <p className="text-xs text-slate-300">
            Cree una cuenta para el equipo administrativo o de cobranza del colegio
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-2xl text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Carlos"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Apellido</label>
              <input
                type="text"
                required
                placeholder="Pierluissi"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              placeholder="cpierluissis@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Usuario</label>
            <input
              type="text"
              required
              placeholder="cpierluissis"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Rol de Acceso</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            >
              <option value="ADMIN">Administrador General del Colegio</option>
              <option value="COBRANZA">Personal de Cobranza (Solo caja y recibos)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Registrando...' : 'Completar Registro'}</span>
          </button>
        </form>

        <div className="pt-3 border-t border-slate-800 text-center text-xs">
          <span className="text-slate-400">¿Ya tiene cuenta? </span>
          <Link href="/admin/login" className="text-emerald-400 hover:text-emerald-300 font-extrabold">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
