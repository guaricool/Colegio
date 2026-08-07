'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Lock, ShieldAlert, LogIn, Building2 } from 'lucide-react';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function AdminRegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

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
        setSuccess(`Usuario ${data.user.username} (${data.user.role}) registrado exitosamente.`);
        setEmail('');
        setUsername('');
        setFirstName('');
        setLastName('');
        setPassword('');
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
    <AdminAuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>Creación Privada de Personal Administrativo</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              U.E. Ramón Pierluissi Ramírez
            </h1>
            <p className="text-xs text-slate-300">
              Registro exclusivo de cuentas autorizado únicamente para el SuperAdmin y Dirección
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs p-3.5 rounded-2xl text-center font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 rounded-2xl text-center font-bold">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Apellido</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                required
                placeholder="usuario_ejemplo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rol de Acceso Privado</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-purple-500/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-extrabold"
              >
                <option value="COBRANZA">🏢 Área de Cobranza (Solo caja, cobros y recibos)</option>
                <option value="ADMIN">👑 Administrador General / Dueño del Colegio</option>
                <option value="SUPER_ADMIN">⚡ SuperAdmin (Acceso total al 100% del sistema)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña Inicial</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold py-3 rounded-2xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center justify-center space-x-2 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Registrando...' : 'Crear Usuario Administrativo'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-center text-xs">
            <Link href="/configuracion" className="text-purple-400 hover:text-purple-300 font-bold">
              Ir a la Configuración General
            </Link>
          </div>
        </div>
      </div>
    </AdminAuthGuard>
  );
}
