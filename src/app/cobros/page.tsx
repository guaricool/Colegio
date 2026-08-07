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
  X,
  Sparkles,
  Inbox,
  ArrowUpRight,
  PhoneCall,
  PhoneOff,
  MessageSquare,
  History,
  UserCheck
} from 'lucide-react';
import { formatUsd, formatVes, formatDate } from '@/lib/utils';
import { generatePaymentReceiptPDF } from '@/lib/pdfGenerator';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function CobrosPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [paymentsHistory, setPaymentsHistory] = useState<any[]>([]);
  const [bcvRate, setBcvRate] = useState<number>(75.51);
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

  // Modal Registro de Llamada / Gestión de Cobranza
  const [selectedCallFee, setSelectedCallFee] = useState<any>(null);
  const [callNotes, setCallNotes] = useState<string>('');
  const [showCallNotesInput, setShowCallNotesInput] = useState(false);
  const [submittingCall, setSubmittingCall] = useState(false);
  const [previousCalls, setPreviousCalls] = useState<any[]>([]);

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
      setBcvRate(bcvJson.usdRate || bcvJson.rate || 75.51);
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

  const openCallModal = async (fee: any) => {
    setSelectedCallFee(fee);
    setCallNotes('');
    setShowCallNotesInput(false);
    try {
      const res = await fetch(`/api/collection-calls?feeId=${fee.id}`);
      const data = await res.json();
      if (data.calls) {
        setPreviousCalls(data.calls);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCall = async (status: 'CONTACTED' | 'NO_ANSWER', customNotes?: string) => {
    if (!selectedCallFee) return;
    setSubmittingCall(true);

    try {
      let sessionUser = null;
      const sessionStr = localStorage.getItem('pierluissi_admin_session');
      if (sessionStr) {
        sessionUser = JSON.parse(sessionStr);
      }

      const payload = {
        studentFeeId: selectedCallFee.id,
        status,
        notes: customNotes || callNotes || (status === 'NO_ANSWER' ? 'Intento fallido - No contestó la llamada' : ''),
        userId: sessionUser?.id || null,
        operatorName: sessionUser ? `${sessionUser.firstName} ${sessionUser.lastName}` : 'Personal de Cobranza',
      };

      const res = await fetch('/api/collection-calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSelectedCallFee(null);
        setCallNotes('');
        setShowCallNotesInput(false);
        await loadAll();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al guardar la gestión');
      }
    } catch (e) {
      console.error(e);
      alert('Error en la conexión');
    } finally {
      setSubmittingCall(false);
    }
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
        generatePaymentReceiptPDF({
          receiptNumber: paymentData.receiptNumber,
          paymentDate: paymentData.paymentDate,
          schoolName: schoolConfig?.name || 'U.E. Ramón Pierluissi Ramírez',
          schoolRif: schoolConfig?.rif || 'J-31489201-4',
          schoolPhone: schoolConfig?.phone || '+58 414-7890123',
          schoolAddress: schoolConfig?.address || 'Valencia, Carabobo',
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
      schoolName: schoolConfig?.name || 'U.E. Ramón Pierluissi Ramírez',
      schoolRif: schoolConfig?.rif || 'J-31489201-4',
      schoolPhone: schoolConfig?.phone || '+58 414-7890123',
      schoolAddress: schoolConfig?.address || 'Valencia, Carabobo',
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
    <AdminAuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COBRANZA']}>
      <div className="space-y-6">
        {/* Title & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-800/30 p-6 rounded-3xl shadow-2xl">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
              <CreditCard className="w-7 h-7 text-emerald-400" />
              <span>Módulo de Cobros & Recibos Digitales</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Gestión de mensualidades, registro de llamadas de cobranza y emisión de recibos PDF
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-1.5 rounded-2xl flex space-x-1.5 shadow-inner">
            <button
              onClick={() => setActiveTab('FEES')}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === 'FEES'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mensualidades Pendientes
            </button>
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-4 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                activeTab === 'PAYMENTS'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Historial de Recibos ({paymentsHistory.length})
            </button>
          </div>
        </div>

        {activeTab === 'FEES' && (
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar estudiante o representante..."
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
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-200 font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Todos los Estados</option>
                  <option value="PENDING">Pendientes</option>
                  <option value="OVERDUE">Vencidos (Morosos)</option>
                  <option value="PARTIAL">Abonos Parciales</option>
                  <option value="PAID">Pagados Totalmente</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
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
                      <th className="px-4 py-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredFees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-12 text-center text-slate-500 space-y-2">
                          <Inbox className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                          <div className="font-semibold text-slate-400">No se encontraron mensualidades en esta categoría</div>
                          <div className="text-[11px] text-slate-500">Utiliza el botón &quot;Estudiantes&quot; para registrar la matrícula o generar mensualidades masivas.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredFees.map((fee) => {
                        const pendingUsd = Math.max(0, fee.amountUsd - fee.paidUsd);
                        const pendingVes = pendingUsd * bcvRate;
                        const isPaid = fee.status === 'PAID';

                        return (
                          <tr key={fee.id} className="table-row-hover">
                            <td className="px-4 py-3.5 font-bold text-slate-200">
                              <div>{fee.student?.firstName} {fee.student?.lastName}</div>
                              <div className="text-[10px] text-emerald-400 font-semibold">
                                {fee.student?.grade?.name} ({fee.student?.grade?.section})
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-300">
                              <div>{fee.student?.representative?.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{fee.student?.representative?.phone}</div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-300 font-semibold">{fee.conceptName}</td>
                            <td className="px-4 py-3.5 font-black text-white">{formatUsd(fee.amountUsd)}</td>
                            <td className="px-4 py-3.5 font-bold text-emerald-400">{formatUsd(fee.paidUsd)}</td>
                            <td className="px-4 py-3.5 font-black text-amber-400">
                              {formatUsd(pendingUsd)}
                              <div className="text-[10px] font-semibold text-slate-400">{formatVes(pendingVes)}</div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-400 font-medium">{formatDate(fee.dueDate)}</td>
                            <td className="px-4 py-3.5">
                              {fee.status === 'PAID' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  PAGADO
                                </span>
                              )}
                              {fee.status === 'OVERDUE' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                  VENCIDO
                                </span>
                              )}
                              {fee.status === 'PARTIAL' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  ABONADO
                                </span>
                              )}
                              {fee.status === 'PENDING' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  PENDIENTE
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {!isPaid && (
                                  <button
                                    onClick={() => openCallModal(fee)}
                                    className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-bold px-3 py-1.5 rounded-xl border border-indigo-500/30 transition-all hover:scale-105"
                                  >
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    <span>Gestión Llamada</span>
                                  </button>
                                )}
                                {!isPaid ? (
                                  <button
                                    onClick={() => openPaymentModal(fee)}
                                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                                  >
                                    Registrar Pago
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-500 font-semibold">Al Día</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'PAYMENTS' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
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
                  {paymentsHistory.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-500">
                        No hay recibos de pago registrados en el historial aún.
                      </td>
                    </tr>
                  ) : (
                    paymentsHistory.map((p) => {
                      const methodMap: Record<string, string> = {
                        PAGO_MOVIL: 'Pago Móvil',
                        ZELLE: 'Zelle',
                        TRANSFERENCIA_VES: 'Transferencia VES',
                        EFECTIVO_USD: 'Efectivo USD',
                        EFECTIVO_VES: 'Efectivo VES',
                      };

                      return (
                        <tr key={p.id} className="table-row-hover">
                          <td className="px-4 py-3.5 font-black text-emerald-400">{p.receiptNumber}</td>
                          <td className="px-4 py-3.5 text-slate-400">{formatDate(p.paymentDate)}</td>
                          <td className="px-4 py-3.5 font-bold text-slate-200">
                            {p.studentFee?.student?.firstName} {p.studentFee?.student?.lastName}
                          </td>
                          <td className="px-4 py-3.5 text-slate-300 font-semibold">
                            {methodMap[p.method] || p.method}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 font-mono">{p.reference || 'N/A'}</td>
                          <td className="px-4 py-3.5 font-black text-white">{formatUsd(p.amountUsd)}</td>
                          <td className="px-4 py-3.5 font-extrabold text-emerald-400">{formatVes(p.amountVes)}</td>
                          <td className="px-4 py-3.5 text-slate-400">{p.bcvRate.toFixed(2)} Bs./$</td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => downloadReceiptAgain(p)}
                              className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-all border border-slate-700 hover:scale-105 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Descargar PDF</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal Registrar Gestión de Llamada (CRM Cobranza) */}
        {selectedCallFee && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white my-8 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                    <PhoneCall className="w-5 h-5 text-indigo-400" />
                    <span>Registro de Gestión de Llamada</span>
                  </h3>
                  <p className="text-xs text-indigo-300 font-bold mt-0.5">{selectedCallFee.conceptName}</p>
                </div>
                <button
                  onClick={() => setSelectedCallFee(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ficha Informativa del Representante */}
              <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl text-xs space-y-2 shadow-inner">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Representante:</span>
                  <span className="font-extrabold text-white text-sm">
                    {selectedCallFee.student?.representative?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cédula:</span>
                  <span className="font-mono text-slate-300">{selectedCallFee.student?.representative?.cedula}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono WhatsApp:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {selectedCallFee.student?.representative?.phone}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800">
                  <span className="text-slate-400 font-medium">Estudiante:</span>
                  <span className="font-bold text-slate-200">
                    {selectedCallFee.student?.firstName} {selectedCallFee.student?.lastName} ({selectedCallFee.student?.grade?.name})
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400 font-medium">Saldo Pendiente:</span>
                  <span className="font-black text-amber-400 text-sm">
                    {formatUsd(selectedCallFee.amountUsd - selectedCallFee.paidUsd)}
                  </span>
                </div>
              </div>

              {/* Botones de Registro Rápido */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-300">
                  Seleccione el Resultado de la Gestión de Cobranza:
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={submittingCall}
                    onClick={() => handleSaveCall('NO_ANSWER')}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 text-rose-300 transition-all hover:scale-105 space-y-1.5 text-center"
                  >
                    <PhoneOff className="w-6 h-6 text-rose-400" />
                    <span className="text-xs font-extrabold">1. Intento Fallido</span>
                    <span className="text-[10px] text-rose-400/80 font-medium">No contestó / Fuera de servicio</span>
                  </button>

                  <button
                    type="button"
                    disabled={submittingCall}
                    onClick={() => setShowCallNotesInput(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 transition-all hover:scale-105 space-y-1.5 text-center"
                  >
                    <UserCheck className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-extrabold">2. Comunicado Con Éxito</span>
                    <span className="text-[10px] text-emerald-400/80 font-medium">Se conversó y dio respuesta</span>
                  </button>
                </div>
              </div>

              {/* Formulario de Observación/Compromiso de Pago */}
              {showCallNotesInput && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/40 space-y-3">
                  <label className="block text-xs font-bold text-indigo-300">
                    Detalles y Compromiso de Pago Acordado:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ej: El representante indica que mañana asistirá a la caja del colegio a pagar en efectivo USD..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-semibold"
                  />

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowCallNotesInput(false)}
                      className="px-3 py-2 text-xs text-slate-400 font-bold hover:text-white"
                    >
                      Atrás
                    </button>
                    <button
                      type="button"
                      disabled={submittingCall || !callNotes.trim()}
                      onClick={() => handleSaveCall('CONTACTED')}
                      className="px-4 py-2 text-xs font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                    >
                      {submittingCall ? 'Guardando...' : 'Guardar Observación & Compromiso'}
                    </button>
                  </div>
                </div>
              )}

              {/* Historial previo de gestiones */}
              {previousCalls.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <History className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Historial de Gestiones Anteriores ({previousCalls.length})</span>
                  </h4>
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
                    {previousCalls.map((c) => (
                      <div key={c.id} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-300">{c.operatorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{formatDate(c.createdAt)}</span>
                        </div>
                        <div className="text-slate-400">{c.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Registrar Pago */}
        {selectedFee && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white my-8 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span>Registrar Pago & Emitir Recibo</span>
                  </h3>
                  <p className="text-xs text-emerald-400 font-bold mt-0.5">{selectedFee.conceptName}</p>
                </div>
                <button
                  onClick={() => setSelectedFee(null)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRegisterPayment} className="space-y-4 pt-1">
                <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs space-y-1.5 shadow-inner">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estudiante:</span>
                    <span className="font-bold text-slate-200">
                      {selectedFee.student?.firstName} {selectedFee.student?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Representante:</span>
                    <span className="font-semibold text-slate-300">
                      {selectedFee.student?.representative?.name} ({selectedFee.student?.representative?.cedula})
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-800">
                    <span className="text-slate-400 font-medium">Saldo Pendiente:</span>
                    <span className="font-black text-amber-400 text-sm">
                      {formatUsd(selectedFee.amountUsd - selectedFee.paidUsd)}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-800/80 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-semibold">Tasa Oficial BCV:</span>
                  <span className="font-black text-white text-sm">{bcvRate.toFixed(2)} Bs./USD</span>
                </div>

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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  {payAmountUsd && (
                    <span className="text-xs text-emerald-400 font-extrabold mt-1.5 block">
                      Equivalente en Bolívares: {formatVes(parseFloat(payAmountUsd || '0') * bcvRate)}
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
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
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Notas / Observaciones (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Pago de mensualidad enviado por Banesco"
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedFee(null)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingPayment}
                    className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2 hover:scale-105"
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
    </AdminAuthGuard>
  );
}
