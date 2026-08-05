'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Building2, CreditCard, DollarSign } from 'lucide-react';

export default function ConfiguracionPage() {
  const [config, setConfig] = useState({
    name: '',
    rif: '',
    phone: '',
    email: '',
    address: '',
    bankDetails: '',
  });
  const [bcvRate, setBcvRate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const [confRes, bcvRes] = await Promise.all([
        fetch('/api/config'),
        fetch('/api/bcv'),
      ]);
      const confJson = await confRes.json();
      const bcvJson = await bcvRes.json();

      setConfig(confJson);
      setBcvRate(bcvJson.rate ? bcvJson.rate.toString() : '105.80');
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
          body: JSON.stringify({ rate: bcvRate }),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Settings className="w-7 h-7 text-blue-400" />
          <span>Configuración del Sistema Escolar</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Ajustes generales del colegio, membrete oficial para recibos y cuentas bancarias (Pago Móvil / Zelle)
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tasa BCV */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span>Tasa BCV del Día (Venezuela)</span>
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tasa Oficial BCV en Bolívares (VES por 1 USD)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={bcvRate}
              onChange={(e) => setBcvRate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Datos del Colegio */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
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
                value={config.name}
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
                value={config.rif}
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
                value={config.phone}
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
                value={config.email}
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
              value={config.address}
              onChange={(e) => setConfig({ ...config, address: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Cuentas Bancarias */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span>Cuentas Bancarias para Recibir Pagos (Pago Móvil / Zelle)</span>
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Información de Pago (Aparece en mensajes de WhatsApp y recibos)
            </label>
            <textarea
              rows={4}
              value={config.bankDetails}
              onChange={(e) => setConfig({ ...config, bankDetails: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
