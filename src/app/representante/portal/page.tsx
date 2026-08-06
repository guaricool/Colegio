'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  CreditCard, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Download, 
  LogOut, 
  Sparkles,
  Phone,
  Inbox,
  AlertCircle,
  X
} from 'lucide-react';
import { formatUsd, formatVes, formatDate } from '@/lib/utils';
import { generatePaymentReceiptPDF } from '@/lib/pdfGenerator';
import { FeeStatusBadge } from '@/components/FeeStatusBadge';

export default function RepresentantePortalPage() {
  const [repData, setRepData] = useState<any>(null);
  const [bcvRate, setBcvRate] = useState<number>(755.15);
  const [schoolConfig, setSchoolConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Modal Pago
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [payAmountUsd, setPayAmountUsd] = useState<string>('');
  const [payMethod, setPayMethod] = useState<string>('PAGO_MOVIL');
  const [payReference, setPayReference] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const loadPortalData = async () => {
    setLoading(true);
    try {
      const sessionStr = localStorage.getItem('pierluissi_rep_session');
      if (!sessionStr) {
        router.push('/representante/login');
        return;
      }

      const session = JSON.parse(sessionStr);

      // Re-fetch datos frescos usando la cédula
      const [loginRes, bcvRes, configRes] = await Promise.all([
        fetch('/api/representatives/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cedula: session.cedula }),
        }),
        fetch('/api/bcv'),
        fetch('/api/config'),
      ]);

      if (loginRes.ok) {
        const freshRep = await loginRes.json();
        setRepData(freshRep);
      } else {
        router.push('/representante/login');
      }

      const bcvJson = await bcvRes.json();
      const configJson = await configRes.json();

      setBcvRate(bcvJson.rate || 755.15);
      setSchoolConfig(configJson);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortalData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('pierluissi_rep_session');
    router.push('/representante/login');
  };

  const openPayModal = (fee: any, student: any) => {
    setSelectedFee({ ...fee, studentObj: student });
    const pendingUsd = fee.amountUsd - fee.paidUsd;
    setPayAmountUsd(pendingUsd.toFixed(2));
    setPayMethod('PAGO_MOVIL');
    setPayReference('');
    setPayNotes('');
  };

  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFee || !payAmountUsd) return;

    setSubmitting(true);
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
        // Generar recibo digital PDF inmediato con membrete oficial
        generatePaymentReceiptPDF({
          receiptNumber: paymentData.receiptNumber,
          paymentDate: paymentData.paymentDate,
          schoolName: schoolConfig?.name || 'U.E. Ramón Pierluissi Ramírez',
          schoolRif: schoolConfig?.rif || 'J-31489201-4',
          schoolPhone: schoolConfig?.phone || '+58 414-7890123',
          schoolAddress: schoolConfig?.address || 'Valencia, Carabobo',
          representativeName: repData.name,
          representativeCedula: repData.cedula,
          studentName: `${selectedFee.studentObj?.firstName} ${selectedFee.studentObj?.lastName}`,
          studentGrade: `${selectedFee.studentObj?.grade?.name} (${selectedFee.studentObj?.grade?.section})`,
          conceptName: selectedFee.conceptName,
          method: payMethod,
          reference: payReference,
          amountUsd: paymentData.amountUsd,
          amountVes: paymentData.amountVes,
          bcvRate: paymentData.bcvRate,
          notes: payNotes,
        });

        setSelectedFee(null);
        await loadPortalData();
      } else {
        alert(paymentData.error || 'Error al registrar el pago');
      }
    } catch (err) {
      console.error(err);
      alert('Error en la solicitud de pago');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !repData) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-300">Cargando estado de cuenta del representante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Representante */}
      <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/60 p-6 rounded-3xl border border-emerald-800/40 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal de Representantes</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Bienvenido(a), {repData.name}
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Cédula: {repData.cedula} | WhatsApp: {repData.phone}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-700 text-rose-400 border border-rose-500/30 text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Datos Bancarios Oficiales para Pago Móvil / Zelle */}
      <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <span>Datos Bancarios Oficiales (Para realizar su transferencia)</span>
          </h2>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            Tasa BCV del Día: {bcvRate.toFixed(2)} Bs./USD
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Pago Móvil */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1.5 text-xs">
            <div className="font-extrabold text-emerald-400 text-sm flex items-center space-x-1.5">
              <Phone className="w-4 h-4" />
              <span>Pago Móvil (Bolívares VES)</span>
            </div>
            <div className="text-slate-300">
              Banco: <strong className="text-white">{schoolConfig?.pagoMovilBank || 'Banesco (0134)'}</strong>
            </div>
            <div className="text-slate-300">
              Teléfono: <strong className="text-white font-mono">{schoolConfig?.pagoMovilPhone || '0414-7890123'}</strong>
            </div>
            <div className="text-slate-300">
              RIF: <strong className="text-white font-mono">{schoolConfig?.pagoMovilRif || 'J-31489201-4'}</strong>
            </div>
          </div>

          {/* Zelle */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl space-y-1.5 text-xs">
            <div className="font-extrabold text-purple-400 text-sm flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Zelle ($ USD)</span>
            </div>
            <div className="text-slate-300">
              Correo Zelle: <strong className="text-white font-mono">{schoolConfig?.zelleEmail || 'pagos@colegioramonpierluissi.com'}</strong>
            </div>
            <div className="text-slate-300">
              Titular: <strong className="text-white">{schoolConfig?.zelleName || 'Colegio Ramón Pierluissi C.A.'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Representados & Mensualidades */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-white flex items-center space-x-2">
          <GraduationCap className="w-6 h-6 text-emerald-400" />
          <span>Sus Estudiantes Representados ({repData.students?.length})</span>
        </h2>

        {repData.students?.map((student: any) => (
          <div key={student.id} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {student.firstName} {student.lastName}
                </h3>
                <span className="text-xs text-emerald-400 font-extrabold">
                  {student.grade?.name} ({student.grade?.section})
                </span>
              </div>
              {student.scholarshipPercent > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  {student.scholarshipPercent}% Beca Asignada
                </span>
              )}
            </div>

            {/* Mensualidades del Alumno */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Concepto</th>
                    <th className="px-4 py-3">Monto ($)</th>
                    <th className="px-4 py-3">Pagado ($)</th>
                    <th className="px-4 py-3">Pendiente ($ / VES)</th>
                    <th className="px-4 py-3">Vencimiento</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {student.fees?.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                        No hay mensualidades registradas para este estudiante actualmente.
                      </td>
                    </tr>
                  ) : (
                    student.fees.map((fee: any) => {
                      const pendingUsd = Math.max(0, fee.amountUsd - fee.paidUsd);
                      const pendingVes = pendingUsd * bcvRate;
                      const isPaid = fee.status === 'PAID';

                      return (
                        <tr key={fee.id} className="table-row-hover">
                          <td className="px-4 py-3.5 font-bold text-slate-200">{fee.conceptName}</td>
                          <td className="px-4 py-3.5 font-black text-white">{formatUsd(fee.amountUsd)}</td>
                          <td className="px-4 py-3.5 font-bold text-emerald-400">{formatUsd(fee.paidUsd)}</td>
                          <td className="px-4 py-3.5 font-black text-amber-400">
                            {formatUsd(pendingUsd)}
                            <div className="text-[10px] font-semibold text-slate-400">{formatVes(pendingVes)}</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-400">{formatDate(fee.dueDate)}</td>
                          <td className="px-4 py-3.5">
                            <FeeStatusBadge status={fee.status} />
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {!isPaid ? (
                              <button
                                onClick={() => openPayModal(fee, student)}
                                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
                              >
                                Reportar Pago
                              </button>
                            ) : (
                              <span className="text-xs text-slate-500 font-semibold">Al Día</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Reportar Pago sin Tarjeta */}
      {selectedFee && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl text-white space-y-4 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <span>Reportar Pago (Sin Tarjeta)</span>
                </h3>
                <p className="text-xs text-emerald-400 font-bold mt-0.5">{selectedFee.conceptName}</p>
              </div>
              <button onClick={() => setSelectedFee(null)} className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4 pt-1">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estudiante:</span>
                  <span className="font-bold text-slate-200">
                    {selectedFee.studentObj?.firstName} {selectedFee.studentObj?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tasa Oficial BCV:</span>
                  <span className="font-black text-amber-400">{bcvRate.toFixed(2)} Bs./USD</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-800">
                  <span className="text-slate-400">Saldo a Pagar:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {formatUsd(selectedFee.amountUsd - selectedFee.paidUsd)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto a Reportar ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payAmountUsd}
                  onChange={(e) => setPayAmountUsd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
                {payAmountUsd && (
                  <span className="text-xs text-emerald-400 font-extrabold mt-1.5 block">
                    Equivalente en Bolívares: {formatVes(parseFloat(payAmountUsd || '0') * bcvRate)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Método Utilizado
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  <option value="PAGO_MOVIL">Pago Móvil (Bolívares VES)</option>
                  <option value="ZELLE">Zelle ($ USD)</option>
                  <option value="TRANSFERENCIA_VES">Transferencia Bancaria (VES)</option>
                  <option value="EFECTIVO_USD">Efectivo ($ USD entregado en administración)</option>
                  <option value="EFECTIVO_VES">Efectivo (Bolívares entregado en administración)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  N° de Referencia Bancaria / Comprobante
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 984120 o ZEL-1920"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notas / Banco Emisor (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Enviado desde Banco Mercantil"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedFee(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{submitting ? 'Registrando...' : 'Confirmar & Descargar Recibo PDF'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
