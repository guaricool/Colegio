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
  Building2,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { formatUsd, formatVes, formatDate, buildWhatsappLink } from '@/lib/utils';

export default function WhatsappPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [bcvRate, setBcvRate] = useState<number>(755.15);
  const [schoolConfig, setSchoolConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('OVERDUE');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
      setBcvRate(bcvJson.rate || 755.15);
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

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 p-6 rounded-3xl border border-emerald-800/40 shadow-2xl">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <MessageSquare className="w-7 h-7 text-emerald-400" />
            <span>Centro de Recordatorios por WhatsApp</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Envío directo de estados de cuenta y avisos de cobranza a representantes (Tasa BCV: <strong className="text-amber-400 font-extrabold">{bcvRate.toFixed(2)} Bs./$</strong>)
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Plantillas con Tasa BCV Oficial</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Buscar por representante o estudiante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="OVERDUE">Solo Cuentas Vencidas (Morosos)</option>
            <option value="PENDING">Pendientes por Vencer</option>
            <option value="PARTIAL">Abonos Parciales</option>
            <option value="ALL">Todas las Cuentas por Cobrar</option>
          </select>
        </div>
      </div>

      {/* Empty State / Cards Grid */}
      {pendingOrOverdueFees.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-white">¡No hay cuentas pendientes en esta categoría!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Todos los representantes están al día o no se han encontrado registros con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pendingOrOverdueFees.map((fee) => {
            const pendingUsd = fee.amountUsd - fee.paidUsd;
            const pendingVes = pendingUsd * bcvRate;
            const repPhone = fee.student?.representative?.phone || '';
            const repName = fee.student?.representative?.name || 'Estimado Representante';
            const studentName = `${fee.student?.firstName} ${fee.student?.lastName}`;
            const gradeName = `${fee.student?.grade?.name} (${fee.student?.grade?.section})`;

            // Mensaje estructurado profesional de cobranza
            const messageText = `Estimado(a) *${repName}*, le saludamos cordialmente de la Administración del *${schoolConfig?.name || 'U.E. Ramón Pierluissi Ramírez'}*.

Le recordamos respetuosamente que la mensualidad (*${fee.conceptName}*) correspondiente a su representado(a) *${studentName}* (${gradeName}) presenta un saldo pendiente por cancelar:

💵 *Saldo Pendiente:* ${formatUsd(pendingUsd)} USD
🇻🇪 *Equivalente en Bolívares:* ${formatVes(pendingVes)} (a Tasa BCV oficial: ${bcvRate.toFixed(2)} Bs./$)
📅 *Fecha de Vencimiento:* ${formatDate(fee.dueDate)}

💳 *DATOS DE PAGO:*
• Pago Móvil: Banesco (0134) - RIF: J-31489201-4 - Tel: 0414-7890123
• Zelle: admonpierluissi@gmail.com

Por favor recuerde reportar su comprobante de pago por este canal para la emisión de su Recibo Digital. ¡Muchas gracias por su atención!`;

            const waUrl = buildWhatsappLink(repPhone, messageText);
            const isCopied = copiedId === fee.id;

            return (
              <div
                key={fee.id}
                className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl glass-card-hover flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                        Representante
                      </span>
                      <h3 className="text-base font-extrabold text-white">{repName}</h3>
                      <p className="text-xs text-emerald-400 font-mono font-bold flex items-center space-x-1 mt-0.5">
                        <PhoneCall className="w-3 h-3" />
                        <span>{repPhone || 'Sin WhatsApp'}</span>
                      </p>
                    </div>
                    {fee.status === 'OVERDUE' ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        VENCIDO / MOROSO
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PENDIENTE
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 text-xs space-y-2 mt-3 shadow-inner">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estudiante:</span>
                      <span className="font-bold text-slate-200">{studentName} ({gradeName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Concepto:</span>
                      <span className="font-semibold text-emerald-400">{fee.conceptName}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-800">
                      <span className="text-slate-400 font-medium">Monto Pendiente:</span>
                      <span className="font-black text-amber-400 text-sm">
                        {formatUsd(pendingUsd)} ({formatVes(pendingVes)})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => copyToClipboard(messageText, fee.id)}
                    className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isCopied ? '¡Copiado!' : 'Copiar Mensaje'}</span>
                  </button>

                  {repPhone ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar WhatsApp</span>
                      <ExternalLink className="w-3 h-3 opacity-80" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Falta N° Teléfono</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
