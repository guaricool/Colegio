'use client';

import React, { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  ExternalLink,
  DollarSign,
  Building2
} from 'lucide-react';
import { formatUsd, formatVes, formatDate, buildWhatsappLink } from '@/lib/utils';

export default function WhatsappPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [bcvRate, setBcvRate] = useState<number>(105.8);
  const [schoolConfig, setSchoolConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('OVERDUE');

  const loadData = async () => {
    setLoading(true);
    try {
      const [feesRes, bcvRes, configRes] = await Promise.all([
        fetch('/api/fees'),
        fetch('/api/bcv'),
        fetch('/api/config'),
      ]);

      const feesJson = await feesRes.json();
      const bcvJson = await bcvRes.json();
      const configJson = await configRes.json();

      setFees(feesJson);
      setBcvRate(bcvJson.rate || 105.8);
      setSchoolConfig(configJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingOrOverdueFees = fees.filter((f) => {
    if (f.status === 'PAID') return false;
    const studentName = `${f.student?.firstName} ${f.student?.lastName}`.toLowerCase();
    const repName = (f.student?.representative?.name || '').toLowerCase();
    const matchesSearch = studentName.includes(searchQuery.toLowerCase()) || repName.includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && f.status === statusFilter;
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Mensaje copiado al portapapeles');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
            <span>Centro de Recordatorios por WhatsApp</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Envío directo de estados de cuenta y mensajes de cobranza preventivos a representantes (Tasa BCV: {bcvRate.toFixed(2)} Bs./$)
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por representante o estudiante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="OVERDUE">Solo Cuentas Vencidas (Morosos)</option>
            <option value="PENDING">Pendientes por Vencer</option>
            <option value="PARTIAL">Abonos Parciales</option>
            <option value="ALL">Todas las Cuentas por Cobrar</option>
          </select>
        </div>
      </div>

      {/* Fee Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pendingOrOverdueFees.map((fee) => {
          const pendingUsd = fee.amountUsd - fee.paidUsd;
          const pendingVes = pendingUsd * bcvRate;
          const repPhone = fee.student?.representative?.phone || '';
          const repName = fee.student?.representative?.name || 'Estimado Representante';
          const studentName = `${fee.student?.firstName} ${fee.student?.lastName}`;
          const gradeName = `${fee.student?.grade?.name} (${fee.student?.grade?.section})`;

          // Mensaje estructurado profesional de cobranza
          const messageText = `Estimado(a) *${repName}*, le saludamos cordialmente de la Administración del *${schoolConfig?.name || 'Colegio Ramón Pierluissi'}*.

Le recordamos respetuosamente que la mensualidad (*${fee.conceptName}*) correspondiente a su representado(a) *${studentName}* (${gradeName}) presenta un saldo pendiente por cancelar:

💵 *Saldo Pendiente:* ${formatUsd(pendingUsd)} USD
🇻🇪 *Equivalente en Bolívares:* ${formatVes(pendingVes)} (a Tasa BCV oficial: ${bcvRate.toFixed(2)} Bs./$)
📅 *Fecha de Vencimiento:* ${formatDate(fee.dueDate)}

💳 *DATOS DE PAGO:*
• Pago Móvil: Banesco (0134) - C.I: 14.582.910 - Tel: 0414-7890123
• Zelle: pagos@colegioramonpierluissi.com

Por favor recuerde reportar su comprobante de pago por este canal para la emisión de su Recibo Digital. ¡Muchas gracias por su atención!`;

          const waUrl = buildWhatsappLink(repPhone, messageText);

          return (
            <div
              key={fee.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase tracking-wider">
                      Representante
                    </span>
                    <h3 className="text-base font-extrabold text-white">{repName}</h3>
                    <p className="text-xs text-emerald-400 font-mono font-medium">{repPhone || 'Sin WhatsApp'}</p>
                  </div>
                  {fee.status === 'OVERDUE' ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      MOROSO
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      PENDIENTE
                    </span>
                  )}
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5 mt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estudiante:</span>
                    <span className="font-semibold text-slate-200">{studentName} ({gradeName})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Concepto:</span>
                    <span className="font-medium text-indigo-300">{fee.conceptName}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800">
                    <span className="text-slate-400 font-medium">Deuda Pendiente:</span>
                    <span className="font-bold text-amber-400">
                      {formatUsd(pendingUsd)} ({formatVes(pendingVes)})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => copyToClipboard(messageText)}
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center space-x-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Mensaje</span>
                </button>

                {repPhone ? (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar WhatsApp</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 font-medium">Falta Teléfono</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
