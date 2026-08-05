'use client';

import React, { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  FileText, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Download,
  X
} from 'lucide-react';
import { formatUsd, formatVes, formatDate } from '@/lib/utils';
import { generatePaymentReceiptPDF } from '@/lib/pdfGenerator';

export default function CobrosPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [paymentsHistory, setPaymentsHistory] = useState<any[]>([]);
  const [bcvRate, setBcvRate] = useState<number>(105.8);
  const [schoolConfig, setSchoolConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'FEES' | 'PAYMENTS'>('FEES');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal Pago
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [payAmountUsd, setPayAmountUsd] = useState<string>('');
  const [payMethod, setPayMethod] = useState<string>('PAGO_MOVIL');
  const [payReference, setPayReference] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [feesRes, bcvRes, configRes, paymentsRes] = await Promise.all([
        fetch('/api/fees'),
        fetch('/api/bcv'),
        fetch('/api/config'),
        fetch('/api/payments'),
      ]);

      const feesJson = await feesRes.json();
      const bcvJson = await bcvRes.json();
      const configJson = await configRes.json();
      const paymentsJson = await paymentsRes.json();

      setFees(feesJson);
      setBcvRate(bcvJson.rate || 105.8);
      setSchoolConfig(configJson);
      setPaymentsHistory(paymentsJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const openPaymentModal = (fee: any) => {
    setSelectedFee(fee);
    const pendingUsd = fee.amountUsd - fee.paidUsd;
    setPayAmountUsd(pendingUsd.toFixed(2));
    setPayMethod('PAGO_MOVIL');
    setPayReference('');
    setPayNotes('');
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || !payAmountUsd) return;

    setSubmittingPayment(true);
    try {
      const payload = {
        studentFeeId: selectedFee.id,
        method: payMethod,
        reference: payReference,
        amountUsd: parseFloat(payAmountUsd),
        bcvRate: bcvRate,
        notes: payNotes,
      };

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const paymentData = await res.json();

      if (res.ok) {
        // Generar Recibo PDF Digital
        generatePaymentReceiptPDF({
          receiptNumber: paymentData.receiptNumber,
          paymentDate: paymentData.paymentDate,
          schoolName: schoolConfig?.name || 'Colegio Ramón Pierluissi',
          schoolRif: schoolConfig?.rif || 'J-31489201-4',
          schoolPhone: schoolConfig?.phone || '+58 414-7890123',
          schoolAddress: schoolConfig?.address || 'Venezuela',
          representativeName: selectedFee.student?.representative?.name || 'N/A',
          representativeCedula: selectedFee.student?.representative?.cedula || 'N/A',
          studentName: `${selectedFee.student?.firstName} ${selectedFee.student?.lastName}`,
          studentGrade: `${selectedFee.student?.grade?.name} (${selectedFee.student?.grade?.section})`,
          conceptName: selectedFee.conceptName,
          method: payMethod,
          reference: payReference,
          amountUsd: paymentData.amountUsd,
          amountVes: paymentData.amountVes,
          bcvRate: paymentData.bcvRate,
          notes: payNotes,
        });

        setSelectedFee(null);
        await loadAll();
      } else {
        alert(paymentData.error || 'Error al registrar el pago');
      }
    } catch (err) {
      console.error(err);
      alert('Error en la solicitud');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const downloadReceiptAgain = (p: any) => {
    generatePaymentReceiptPDF({
      receiptNumber: p.receiptNumber,
      paymentDate: p.paymentDate,
      schoolName: schoolConfig?.name || 'Colegio Ramón Pierluissi',
      schoolRif: schoolConfig?.rif || 'J-31489201-4',
      schoolPhone: schoolConfig?.phone || '+58 414-7890123',
      schoolAddress: schoolConfig?.address || 'Venezuela',
      representativeName: p.studentFee?.student?.representative?.name || 'N/A',
      representativeCedula: p.studentFee?.student?.representative?.cedula || 'N/A',
      studentName: `${p.studentFee?.student?.firstName} ${p.studentFee?.student?.lastName}`,
      studentGrade: `${p.studentFee?.student?.grade?.name} (${p.studentFee?.student?.grade?.section})`,
      conceptName: p.studentFee?.conceptName,
      method: p.method,
      reference: p.reference,
      amountUsd: p.amountUsd,
      amountVes: p.amountVes,
      bcvRate: p.bcvRate,
      notes: p.notes,
    });
  };

  const filteredFees = fees.filter((f) => {
    const studentName = `${f.student?.firstName} ${f.student?.lastName}`.toLowerCase();
    const repName = (f.student?.representative?.name || '').toLowerCase();
    const matchesSearch = studentName.includes(searchQuery.toLowerCase()) || repName.includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && f.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <CreditCard className="w-7 h-7 text-blue-400" />
            <span>Módulo de Cobros y Recibos</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de mensualidades, registro de pagos (Pago Móvil/Zelle) y emisión de recibos digitales
          </p>
        </div>

        {/* Tabs Switcher */}
        <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex space-x-1">
          <button
            onClick={() => setActiveTab('FEES')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'FEES'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Mensualidades Pendientes
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'PAYMENTS'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Historial de Recibos ({paymentsHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'FEES' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por estudiante o representante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="PENDING">Pendientes</option>
                <option value="OVERDUE">Vencidos</option>
                <option value="PARTIAL">Abonados Parcial</option>
                <option value="PAID">Pagados Totalmente</option>
              </select>
            </div>
          </div>

          {/* Fees Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5">Estudiante & Grado</th>
                    <th className="px-4 py-3.5">Representante</th>
                    <th className="px-4 py-3.5">Concepto</th>
                    <th className="px-4 py-3.5">Monto ($)</th>
                    <th className="px-4 py-3.5">Pagado ($)</th>
                    <th className="px-4 py-3.5">Pendiente ($ / VES)</th>
                    <th className="px-4 py-3.5">Vencimiento</th>
                    <th className="px-4 py-3.5">Estado</th>
                    <th className="px-4 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFees.map((fee) => {
                    const pendingUsd = Math.max(0, fee.amountUsd - fee.paidUsd);
                    const pendingVes = pendingUsd * bcvRate;
                    const isPaid = fee.status === 'PAID';

                    return (
                      <tr key={fee.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-slate-200">
                          <div>{fee.student?.firstName} {fee.student?.lastName}</div>
                          <div className="text-[10px] text-blue-400 font-normal">
                            {fee.student?.grade?.name} ({fee.student?.grade?.section})
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300">
                          <div>{fee.student?.representative?.name}</div>
                          <div className="text-[10px] text-slate-500">{fee.student?.representative?.phone}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300 font-medium">{fee.conceptName}</td>
                        <td className="px-4 py-3.5 font-bold text-white">{formatUsd(fee.amountUsd)}</td>
                        <td className="px-4 py-3.5 font-semibold text-emerald-400">{formatUsd(fee.paidUsd)}</td>
                        <td className="px-4 py-3.5 font-bold text-amber-400">
                          {formatUsd(pendingUsd)}
                          <div className="text-[10px] font-medium text-slate-400">{formatVes(pendingVes)}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">{formatDate(fee.dueDate)}</td>
                        <td className="px-4 py-3.5">
                          {fee.status === 'PAID' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              PAGADO
                            </span>
                          )}
                          {fee.status === 'OVERDUE' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              VENCIDO
                            </span>
                          )}
                          {fee.status === 'PARTIAL' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              ABONADO
                            </span>
                          )}
                          {fee.status === 'PENDING' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              PENDIENTE
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {!isPaid ? (
                            <button
                              onClick={() => openPaymentModal(fee)}
                              className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-md transition-colors"
                            >
                              Registrar Pago
                            </button>
                          ) : (
                            <span className="text-xs text-slate-500 font-medium">Al Día</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Historial de Pagos / Recibos Emitidos */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">N° Recibo</th>
                  <th className="px-4 py-3.5">Fecha</th>
                  <th className="px-4 py-3.5">Estudiante</th>
                  <th className="px-4 py-3.5">Método</th>
                  <th className="px-4 py-3.5">Referencia</th>
                  <th className="px-4 py-3.5">Monto ($)</th>
                  <th className="px-4 py-3.5">Monto (VES)</th>
                  <th className="px-4 py-3.5">Tasa BCV</th>
                  <th className="px-4 py-3.5 text-right">Recibo PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {paymentsHistory.map((p) => {
                  const methodMap: Record<string, string> = {
                    PAGO_MOVIL: 'Pago Móvil',
                    ZELLE: 'Zelle',
                    TRANSFERENCIA_VES: 'Transferencia VES',
                    EFECTIVO_USD: 'Efectivo USD',
                    EFECTIVO_VES: 'Efectivo VES',
                  };

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-bold text-blue-400">{p.receiptNumber}</td>
                      <td className="px-4 py-3.5 text-slate-400">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3.5 font-medium text-slate-200">
                        {p.studentFee?.student?.firstName} {p.studentFee?.student?.lastName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300 font-semibold">
                        {methodMap[p.method] || p.method}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400">{p.reference || 'N/A'}</td>
                      <td className="px-4 py-3.5 font-bold text-white">{formatUsd(p.amountUsd)}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400">{formatVes(p.amountVes)}</td>
                      <td className="px-4 py-3.5 text-slate-400">{p.bcvRate.toFixed(2)} Bs./$</td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => downloadReceiptAgain(p)}
                          className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-blue-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar PDF</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Registrar Pago */}
      {selectedFee && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl text-white my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Registrar Pago & Emitir Recibo</h3>
                <p className="text-xs text-blue-400 mt-0.5">{selectedFee.conceptName}</p>
              </div>
              <button
                onClick={() => setSelectedFee(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4 pt-4">
              {/* Estudiante Info Box */}
              <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estudiante:</span>
                  <span className="font-bold text-slate-200">
                    {selectedFee.student?.firstName} {selectedFee.student?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Representante:</span>
                  <span className="font-medium text-slate-300">
                    {selectedFee.student?.representative?.name} ({selectedFee.student?.representative?.cedula})
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Saldo Pendiente:</span>
                  <span className="font-bold text-amber-400">
                    {formatUsd(selectedFee.amountUsd - selectedFee.paidUsd)}
                  </span>
                </div>
              </div>

              {/* Tasa BCV Info */}
              <div className="bg-blue-950/40 border border-blue-800/50 p-3 rounded-xl flex items-center justify-between text-xs">
                <span className="text-blue-300 font-medium">Tasa BCV del Día:</span>
                <span className="font-bold text-white">{bcvRate.toFixed(2)} Bs./USD</span>
              </div>

              {/* Form Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto a Pagar ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmountUsd}
                  onChange={(e) => setPayAmountUsd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
                {payAmountUsd && (
                  <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                    Equivalente a pagar: {formatVes(parseFloat(payAmountUsd || '0') * bcvRate)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Método de Pago
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="PAGO_MOVIL">Pago Móvil (Bolívares)</option>
                  <option value="ZELLE">Zelle (USD)</option>
                  <option value="TRANSFERENCIA_VES">Transferencia Bancaria (Bolívares)</option>
                  <option value="EFECTIVO_USD">Efectivo ($ USD)</option>
                  <option value="EFECTIVO_VES">Efectivo (Bolívares)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  N° de Referencia / Comprobante Bancario
                </label>
                <input
                  type="text"
                  placeholder="Ej: 984120 o ZEL-1920"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas / Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Pago realizado por Banesco"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedFee(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{submittingPayment ? 'Procesando...' : 'Confirmar Pago & Descargar Recibo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
