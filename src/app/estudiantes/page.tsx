'use client';

import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, 
  UserPlus, 
  Users, 
  Search, 
  PlusCircle, 
  Percent, 
  Check, 
  X,
  BookOpen,
  Inbox,
  Sparkles
} from 'lucide-react';
import { formatUsd } from '@/lib/utils';
import { AdminAuthGuard } from '@/components/AdminAuthGuard';

export default function EstudiantesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modales
  const [showRepModal, setShowRepModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showMassiveFeeModal, setShowMassiveFeeModal] = useState(false);

  // Forms Rep
  const [repName, setRepName] = useState('');
  const [repCedula, setRepCedula] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repEmail, setRepEmail] = useState('');

  // Forms Student
  const [stFirstName, setStFirstName] = useState('');
  const [stLastName, setStLastName] = useState('');
  const [stCedula, setStCedula] = useState('');
  const [stScholarship, setStScholarship] = useState('0');
  const [stRepId, setStRepId] = useState('');

  // Forms Massive Fee
  const [feeConceptName, setFeeConceptName] = useState('Mensualidad Noviembre 2026');
  const [feeDueDate, setFeeDueDate] = useState('2026-11-05');

  const loadData = async () => {
    setLoading(true);
    try {
      const [stRes, repRes] = await Promise.all([
        fetch('/api/students'),
        fetch('/api/representatives'),
      ]);
      const stJson = await stRes.json();
      const repJson = await repRes.json();

      setStudents(stJson);
      setRepresentatives(repJson);
      if (repJson.length > 0) {
        setStRepId(repJson[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRep = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/representatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: repName,
          cedula: repCedula,
          phone: repPhone,
          email: repEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowRepModal(false);
        setRepName('');
        setRepCedula('');
        setRepPhone('');
        setRepEmail('');
        await loadData();
      } else {
        alert(data.error || 'Error al crear representante');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateMassiveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'GENERATE_MASSIVE',
          conceptName: feeConceptName,
          dueDate: feeDueDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`¡Éxito! Se han generado ${data.count} cargos de mensualidad.`);
        setShowMassiveFeeModal(false);
        await loadData();
      } else {
        alert(data.error || 'Error al generar mensualidades');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredStudents = students.filter((s) => {
    const name = `${s.firstName} ${s.lastName}`.toLowerCase();
    const rep = (s.representative?.name || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase()) || rep.includes(searchQuery.toLowerCase());
  });

  return (
    <AdminAuthGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'COBRANZA']}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-indigo-950/40 p-6 rounded-3xl border border-emerald-800/30 shadow-2xl">
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
              <GraduationCap className="w-7 h-7 text-emerald-400" />
              <span>Estudiantes & Representantes</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Matrícula escolar oficial, control de becas y facturación masiva para la U.E. Ramón Pierluissi Ramírez
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowRepModal(true)}
              className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-all hover:scale-105"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Nuevo Representante</span>
            </button>

            <button
              onClick={() => setShowMassiveFeeModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generar Mensualidad Masiva</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar estudiante o representante por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="text-xs text-slate-300 font-semibold bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
            Matrícula Registrada: <strong className="text-emerald-400 font-extrabold">{students.length} alumnos</strong>
          </div>
        </div>

        {/* Table Estudiantes */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Estudiante</th>
                  <th className="px-4 py-3.5">Cédula / Código</th>
                  <th className="px-4 py-3.5">Grado / Sección</th>
                  <th className="px-4 py-3.5">Tarifa Base ($)</th>
                  <th className="px-4 py-3.5">Beca (%)</th>
                  <th className="px-4 py-3.5">Representante</th>
                  <th className="px-4 py-3.5">Teléfono WhatsApp</th>
                  <th className="px-4 py-3.5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-500 space-y-2">
                      <Inbox className="w-10 h-10 mx-auto text-slate-600 opacity-60" />
                      <div className="font-semibold text-slate-400">No hay alumnos ni representantes registrados en este momento</div>
                      <div className="text-[11px] text-slate-500">Utiliza el botón &quot;Nuevo Representante&quot; para registrar la matrícula real.</div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((st) => {
                    const baseUsd = st.grade?.monthlyFeeUsd || 0;
                    const discount = (baseUsd * st.scholarshipPercent) / 100;
                    const finalUsd = baseUsd - discount;

                    return (
                      <tr key={st.id} className="table-row-hover">
                        <td className="px-4 py-3.5 font-extrabold text-white">
                          {st.firstName} {st.lastName}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 font-mono font-medium">{st.cedula}</td>
                        <td className="px-4 py-3.5 text-emerald-400 font-extrabold">
                          {st.grade?.name} ({st.grade?.section})
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-200">{formatUsd(baseUsd)}</td>
                        <td className="px-4 py-3.5">
                          {st.scholarshipPercent > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {st.scholarshipPercent}% Beca ({formatUsd(finalUsd)})
                            </span>
                          ) : (
                            <span className="text-slate-500 font-medium">Sin Beca</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-300">
                          <div>{st.representative?.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{st.representative?.cedula}</div>
                        </td>
                        <td className="px-4 py-3.5 text-emerald-400 font-mono font-bold">
                          {st.representative?.phone}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ACTIVO
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Nuevo Representante */}
        {showRepModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <UserPlus className="w-5 h-5 text-emerald-400" />
                  <span>Registrar Representante</span>
                </h3>
                <button onClick={() => setShowRepModal(false)} className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateRep} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Carmen Rodríguez"
                    value={repName}
                    onChange={(e) => setRepName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cédula de Identidad (V- / E-)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: V-15.420.198"
                    value={repCedula}
                    onChange={(e) => setRepCedula(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono WhatsApp (Venezuela +58)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: +584141234567"
                    value={repPhone}
                    onChange={(e) => setRepPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@email.com"
                    value={repEmail}
                    onChange={(e) => setRepEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRepModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/30"
                  >
                    Guardar Representante
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Mensualidad Masiva */}
        {showMassiveFeeModal && (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl text-white space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-lg font-extrabold text-white flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Generar Mensualidad Masiva</span>
                </h3>
                <button onClick={() => setShowMassiveFeeModal(false)} className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Se creará el cargo de cobro para todos los estudiantes activos aplicando las becas correspondientes.
              </p>
              <form onSubmit={handleGenerateMassiveFees} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Concepto
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Mensualidad Noviembre 2026"
                    value={feeConceptName}
                    onChange={(e) => setFeeConceptName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    required
                    value={feeDueDate}
                    onChange={(e) => setFeeDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowMassiveFeeModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-xs font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-600/30"
                  >
                    Generar Cargos Masivos
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
