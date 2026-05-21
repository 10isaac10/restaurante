import React, { useState } from 'react';
import { Staff, Shift, StaffRole } from '../types';
import { 
  Users, 
  Clock, 
  Calendar, 
  PlusCircle, 
  CheckCircle, 
  UserMinus, 
  UserX, 
  Briefcase, 
  PhoneCall, 
  Mail,
  ListFilter,
  Key
} from 'lucide-react';

interface StaffManagerProps {
  staffList: Staff[];
  shiftsList: Shift[];
  onAddStaff: (newStaff: Omit<Staff, 'id'>) => void;
  onAddShift: (newShift: Omit<Shift, 'id'>) => void;
  onRemoveStaff: (staffId: string) => void;
  onRemoveShift: (shiftId: string) => void;
}

export default function StaffManager({
  staffList,
  shiftsList,
  onAddStaff,
  onAddShift,
  onRemoveStaff,
  onRemoveShift
}: StaffManagerProps) {
  // Current tab inside Personal: employees database vs scheduling timeline
  const [subSection, setSubSection] = useState<'employees' | 'shifts'>('employees');

  // New staff form states
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<StaffRole>('mesero');
  const [newStaffPhone, setNewStaffPhone] = useState<string>('');
  const [newStaffEmail, setNewStaffEmail] = useState<string>('');
  const [newStaffPassword, setNewStaffPassword] = useState<string>('');

  // New shift planner states
  const [selectedStaffForShift, setSelectedStaffForShift] = useState<string>(staffList[0]?.id || '');
  const [shiftDate, setShiftDate] = useState<string>('2026-05-21'); // Preload active day
  const [shiftStart, setShiftStart] = useState<string>('09:00');
  const [shiftEnd, setShiftEnd] = useState<string>('17:00');

  const getRoleIconBadge = (role: StaffRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Administrador', styles: 'bg-indigo-150 text-indigo-800 border-indigo-250' };
      case 'chef':
        return { label: 'Chef/Cocina', styles: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'mesero':
        return { label: 'Mesero/Salón', styles: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'cajero':
        return { label: 'Cajero/Caja', styles: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    }
  };

  const handleHireStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      alert('Ingresa el nombre del colaborador.');
      return;
    }

    onAddStaff({
      name: newStaffName,
      role: newStaffRole,
      phone: newStaffPhone || 'No registrado',
      email: newStaffEmail || 'No registrado',
      status: 'activo',
      password: newStaffPassword.trim() || '1234'
    });

    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');
    setNewStaffPassword('');
    alert(`Personal "${newStaffName}" dado de alta con éxito.`);
  };

  const handleBookShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffForShift) {
      alert('Selecciona un colaborador.');
      return;
    }

    const employeeObj = staffList.find(s => s.id === selectedStaffForShift);
    if (!employeeObj) return;

    onAddShift({
      staffId: selectedStaffForShift,
      staffName: employeeObj.name,
      staffRole: employeeObj.role,
      date: shiftDate,
      startTime: shiftStart,
      endTime: shiftEnd
    });

    alert(`Turno agendado exitosamente para ${employeeObj.name}.`);
  };

  return (
    <div className="flex-1 flex bg-slate-50 overflow-hidden">
      {/* Left panel body contents */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* Sub section tab switch toolbar */}
        <div className="p-6 border-b border-slate-200 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Personal y Horarios de Trabajo</h2>
            <p className="text-xs text-slate-500">Administra el directorio de colaboradores y planifica turnos semanales/diarios.</p>
          </div>

          {/* Tab selector buttons */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              id="sub-tab-employees"
              onClick={() => setSubSection('employees')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                subSection === 'employees'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5 inline mr-1.5" />
              Directorio Colaboradores
            </button>
            <button
              id="sub-tab-shifts"
              onClick={() => setSubSection('shifts')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                subSection === 'shifts'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <Clock className="h-3.5 w-3.5 inline mr-1.5" />
              Planificador Horarios
            </button>
          </div>
        </div>

        {/* Dynamic viewing segment */}
        <div className="flex-1 p-6 overflow-y-auto">
          {subSection === 'employees' ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider font-mono">Equipo de Servicio ({staffList.length})</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {staffList.map((stObj) => {
                  const roleBadge = getRoleIconBadge(stObj.role);
                  return (
                    <div key={stObj.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs flex flex-col justify-between hover:border-slate-350">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 font-sans">{stObj.name}</h4>
                            <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wide mt-0.5 block">Alta activa</span>
                          </div>
                          
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleBadge.styles}`}>
                            {roleBadge.label}
                          </span>
                        </div>

                        {/* Contacts panel */}
                        <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-650 font-mono">
                          <div className="flex items-center gap-2">
                            <PhoneCall className="h-3.5 w-3.5 text-slate-400" />
                            <span>{stObj.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            <span>{stObj.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-slate-400" />
                            <span>Contraseña: <strong className="text-indigo-600 font-mono">{stObj.password || '1234'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* De-registration / Fire employee action button */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          id={`fire-staff-${stObj.id}`}
                          onClick={() => {
                            if (confirm(`¿Dar de baja temporal o definitiva a ${stObj.name}?`)) {
                              onRemoveStaff(stObj.id);
                            }
                          }}
                          className="text-[10px] text-rose-500 font-sans font-bold flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-rose-200"
                        >
                          <UserX className="h-3 w-3" />
                          Dar de Baja
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider font-mono">Horarios Agendados para: {shiftDate}</h3>
              
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="min-w-full text-left font-sans text-xs border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-mono text-[10px] font-bold tracking-wide">
                    <tr>
                      <th className="px-6 py-3.5">Colaborador</th>
                      <th className="px-6 py-3.5">Cargo/Estación</th>
                      <th className="px-6 py-3.5">Día de Turno</th>
                      <th className="px-6 py-3.5 text-center">Horario Entrada/Salida</th>
                      <th className="px-6 py-3.5 text-center">Remover</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {shiftsList.map((shiftObj) => {
                      const rBadge = getRoleIconBadge(shiftObj.staffRole);
                      return (
                        <tr key={shiftObj.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-semibold text-slate-900">{shiftObj.staffName}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${rBadge.styles}`}>
                              {rBadge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{shiftObj.date}</td>
                          <td className="px-6 py-4 text-center font-bold font-mono text-slate-800 bg-emerald-50/30">
                            {shiftObj.startTime} - {shiftObj.endTime}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              id={`remove-shift-${shiftObj.id}`}
                              onClick={() => {
                                if (confirm('¿Eliminar esta asignación de turno del cronoposter?')) {
                                  onRemoveShift(shiftObj.id);
                                }
                              }}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors cursor-pointer"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {shiftsList.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-slate-400 font-sans">
                          No hay turnos planificados para esta fecha aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right form column: dynamic sidebar selector depending on the sub tab state */}
      <div className="w-96 border-l border-slate-200 bg-white shadow-xl flex flex-col shrink-0 p-6 overflow-y-auto">
        {subSection === 'employees' ? (
          <div>
            <div className="border-b border-slate-100 pb-5 mb-5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block mb-1">Recursos Humanos</span>
              <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-1.5">
                <PlusCircle className="h-4.5 w-4.5 text-emerald-500" />
                <span>Alta Nuevo Colaborador</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Registra nuevos meseros, cocineros, o cajeros para el control de accesos.</p>
            </div>

            <form onSubmit={handleHireStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Nombre Completo *</label>
                <input
                  id="new-staff-name"
                  type="text"
                  placeholder="Ej. Sofia Ruiz Ramos"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 font-sans">Cargo / Puesto Operativo *</label>
                <select
                  id="new-staff-role"
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as StaffRole)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 cursor-pointer"
                >
                  <option value="mesero">Mesero / Camarero</option>
                  <option value="chef">Chef / Cocinero</option>
                  <option value="cajero">Cajero / Cobros</option>
                  <option value="admin">Administrador / Supervisor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Teléfono Whatsapp *</label>
                <input
                  id="new-staff-phone"
                  type="text"
                  placeholder="Ej. 551-234-5678"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Email corporativo *</label>
                <input
                  id="new-staff-email"
                  type="email"
                  placeholder="Ej. sofia.ruiz@gmail.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Contraseña / PIN de Acceso *</label>
                <input
                  id="new-staff-password"
                  type="text"
                  placeholder="Ej. 1234 (Por defecto 1234)"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Registrar Colaborador
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="border-b border-slate-100 pb-5 mb-5">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block mb-1">Rotaciones</span>
              <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-emerald-500" />
                <span>Asignar Horario de Turno</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">Programa turnos diarios con horarios límites para automatizar las nóminas.</p>
            </div>

            <form onSubmit={handleBookShift} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Seleccionar Colaborador *</label>
                <select
                  id="shift-staff-select"
                  value={selectedStaffForShift}
                  onChange={(e) => setSelectedStaffForShift(e.target.value)}
                  className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 cursor-pointer"
                >
                  <option value="">-- Colaborador --</option>
                  {staffList.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Día Programado *</label>
                <input
                  id="shift-date-input"
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 font-sans">Hora Entrada *</label>
                  <input
                    id="shift-start-input"
                    type="time"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 font-sans">Hora Salida *</label>
                  <input
                    id="shift-end-input"
                    type="time"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide uppercase rounded-xl transition-all shadow-md cursor-pointer"
              >
                Agendar Turno Operativo
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
