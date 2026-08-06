'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, 
  Save, 
  Building2, 
  CreditCard, 
  DollarSign, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  AlertTriangle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function ConfiguracionPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [roleForbidden, setRoleForbidden] = useState(false);

  const [config, setConfig] = useState<any>({
    name: '',
    rif: '',
    phone: '',
    email: '',
    address: '',
    pagoMovilBank: '',
    pagoMovilPhone: '',
    pagoMovilRif: '',
    zelleEmail: '',
    zelleName: '',
  });

  const [bcvRate, setBcvRate] = useState('');
  const [bcvEurRate, setBcvEurRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Lista de usuarios y formulario de creación de personal
  const [usersList, setUsersList] = useState<any[]>([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('COBRANZA');
  const [creatingUser, setCreatingUser] = useState(false);
  const [userSuccessMsg, setUserSuccessMsg] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const sessionStr = localStorage.getItem('pierluissi_admin_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        setCurrentUser(session);

        // Si el usuario pertenece al Área de Cobranza, bloquear acceso a configuración
        if (session.role === 'COBRANZA') {
          setRoleForbidden(true);
          setTimeout(() => {
            router.push('/cobros');
          }, 2500);
          return;
        }
      }

      const [confRes, bcvRes, usersRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/bcv'),
        fetch('/api/users'),
      ]);

      const confJson = await confRes.json();
      const bcvJson = await bcvRes.json();
      const usersJson = await usersRes.json();

      setConfig(confJson);
      setBcvRate(bcvJson.usdRate ? bcvJson.usdRate.toString() : '75.51');
      setBcvEurRate(bcvJson.eurRate ? bcvJson.eurRate.toString() : '81.20');
      if (Array.isArray(usersJson)) setUsersList(usersJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        }),
        fetch('/api/bcv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rate: bcvRate, eurRate: bcvEurRate }),
        }),
      ]);
      alert('Configuración guardada exitosamente');
      await loadConfig();
    } catch (e) {
      console.error(e);
      alert('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    setUserSuccessMsg(null);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newUserEmail,
          username: newUserUsername,
          firstName: newUserFirstName,
          lastName: newUserLastName,
          password: newUserPassword,
          role: newUserRole,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserSuccessMsg(`Usuario ${data.firstName} ${data.lastName} (${data.role}) registrado exitosamente.`);
        setNewUserEmail('');
        setNewUserUsername('');
        setNewUserFirstName('');
        setNewUserLastName('');
        setNewUserPassword('');
        setNewUserRole('COBRANZA');

        const updatedUsers = await fetch('/api/users').then((r) => r.json());
        if (Array.isArray(updatedUsers)) setUsersList(updatedUsers);
      } else {
        alert(data.error || 'Error al crear usuario');
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar registro de personal');
    } finally {
      setCreatingUser(false);
    }
  };

  if (roleForbidden) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-8 max-w-md text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Acceso Restringido por Rol</h2>
          <p className="text-xs text-slate-300">
            Su cuenta pertenece al <strong className="text-amber-400">Área de Cobranza</strong>. No posee permisos para modificar la configuración ni los usuarios del colegio.
          </p>
          <div className="text-xs text-emerald-400 font-bold animate-pulse">
            Redirigiendo automáticamente a la sección de Cobros...
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <Settings className="w-7 h-7 text-blue-400" />
          <span>Configuración General & Gestión de Personal</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajustes institucionales, cuentas bancarias, tasas BCV y creación de usuarios para el Área de Cobranza y Administración
        </p>
      </div>

      {/* SECCIÓN ESPECIAL: Crear Usuarios para el Área de Cobranza / Personal */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-xs font-bold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Control de Personal & Roles</span>
            </div>
            <h2 className="text-lg font-extrabold text-white">
              Crear Nuevo Usuario (Área de Cobranza o Administración)
            </h2>
            <p className="text-xs text-slate-300">
              Registra cajeros o personal que solo atenderán cobros presenciales, transferencias y recibos sin acceso a configuración.
            </p>
          </div>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-extrabold px-3 py-1.5 rounded-full">
              SuperAdmin: cpierluissis@gmail.com
            </span>
          )}
        </div>

        {userSuccessMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs p-3.5 rounded-2xl font-bold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{userSuccessMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
              <input
                type="text"
                required
                placeholder="Ej: Katherine"
                value={newUserFirstName}
                onChange={(e) => setNewUserFirstName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Apellido</label>
              <input
                type="text"
                required
                placeholder="Ej: Lizardi"
                value={newUserLastName}
                onChange={(e) => setNewUserLastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rol de Acceso</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full bg-slate-950 border border-indigo-500/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-extrabold"
              >
                <option value="COBRANZA">🏢 Área de Cobranza (Solo caja, cobros y recibos)</option>
                <option value="ADMIN">👑 Administrador General del Colegio</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="cobranza@colegio.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre de Usuario</label>
              <input
                type="text"
                required
                placeholder="caja1"
                value={newUserUsername}
                onChange={(e) => setNewUserUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={creatingUser}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4" />
              <span>{creatingUser ? 'Registrando...' : 'Registrar Usuario de Cobranza'}</span>
            </button>
          </div>
        </form>

        {/* Tabla de Usuarios Registrados */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            Usuarios Registrados en el Sistema ({usersList.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Usuario</th>
                  <th className="px-4 py-2.5">Nombre & Apellido</th>
                  <th className="px-4 py-2.5">Correo</th>
                  <th className="px-4 py-2.5">Rol de Permisos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usersList.map((u) => (
                  <tr key={u.id} className="table-row-hover">
                    <td className="px-4 py-3 font-mono font-bold text-white">{u.username}</td>
                    <td className="px-4 py-3 text-slate-200 font-semibold">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                        u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : u.role === 'ADMIN'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {u.role === 'SUPER_ADMIN' ? '👑 SUPER ADMIN 100%' : u.role === 'ADMIN' ? 'Administrador' : '🏢 Área de Cobranza'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tasas BCV Duales */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Tasas Oficiales BCV (Venezuela)</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tasa Dólar BCV ($ USD en Bolívares VES)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={bcvRate}
                onChange={(e) => setBcvRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tasa Euro BCV (€ EUR en Bolívares VES)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={bcvEurRate}
                onChange={(e) => setBcvEurRate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Datos del Colegio */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            <span>Datos Institucionales del Colegio</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la Institución
              </label>
              <input
                type="text"
                required
                value={config.name || ''}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                RIF Institucional
              </label>
              <input
                type="text"
                required
                value={config.rif || ''}
                onChange={(e) => setConfig({ ...config, rif: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono de Contacto / WhatsApp
              </label>
              <input
                type="text"
                required
                value={config.phone || ''}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={config.email || ''}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Dirección Física
            </label>
            <input
              type="text"
              required
              value={config.address || ''}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios de Configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
