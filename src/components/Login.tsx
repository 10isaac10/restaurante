import React, { useState } from 'react';
import { Staff } from '../types';
import { Sparkles, Key, UserCheck, ShieldAlert, BadgeCheck } from 'lucide-react';

interface LoginProps {
  staffList: Staff[];
  onLoginSuccess: (staffMember: Staff) => void;
}

export default function Login({ staffList, onLoginSuccess }: LoginProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const activeStaff = staffList.filter(s => s.status === 'activo');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedStaffId) {
      setError('Por favor, selecciona tu usuario de la lista.');
      return;
    }

    const employee = activeStaff.find(s => s.id === selectedStaffId);
    if (!employee) {
      setError('Usuario no encontrado.');
      return;
    }

    // Default password '1234' if none specified in the record
    const correctPassword = employee.password || '1234';

    if (password === correctPassword) {
      onLoginSuccess(employee);
    } else {
      setError('Contraseña incorrecta. Por favor, intenta de nuevo.');
    }
  };

  const selectedEmployee = activeStaff.find(s => s.id === selectedStaffId);

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients and Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-505/5 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl relative z-10">
        
        {/* Logo and Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 mb-3">
            <Sparkles className="h-8 w-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">RestoGest</h1>
          <p className="text-xs text-slate-500 font-mono mt-1">SISTEMA ERP DE CONTROL GASTRONÓMICO</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 font-mono">Seleccionar Colaborador / Usuario</label>
            <select
              id="login-staff-select"
              value={selectedStaffId}
              onChange={(e) => {
                setSelectedStaffId(e.target.value);
                setError(null);
              }}
              className="w-full bg-slate-50/70 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-0 cursor-pointer text-ellipsis"
            >
              <option value="" className="text-slate-500 bg-white">-- Selecciona tu Nombre --</option>
              {activeStaff.map((emp) => {
                const getRoleSpanish = (role: string) => {
                  switch (role) {
                    case 'admin': return 'Administrador';
                    case 'mesero': return 'Mesero';
                    case 'chef': return 'Cocinero/Chef';
                    case 'cajero': return 'Cajero';
                    default: return role;
                  }
                };
                return (
                  <option key={emp.id} value={emp.id} className="text-slate-900 bg-white">
                    {emp.name} ({getRoleSpanish(emp.role)})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Contraseña de Acceso (PIN)</label>
              {selectedEmployee && (
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wide">
                  Rol: {selectedEmployee.role === 'mesero' ? 'Mesero (Restringido)' : 'Full Access'}
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">
                <Key className="h-4 w-4" />
              </span>
              <input
                id="login-password-input"
                type="password"
                placeholder="••••"
                pattern="[0-9a-zA-Z]*"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-50/70 border border-slate-200 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-0 tracking-widest"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 animate-shake">
              <ShieldAlert className="h-4 w-4 text-rose-605 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            id="login-submit-button"
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm tracking-wide uppercase rounded-xl transition-all shadow-md hover:shadow-indigo-100 cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <UserCheck className="h-4.5 w-4.5" />
            Ingresar al Sistema
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-medium">RestoGest Terminal V2.4 © 2026</span>
        </div>

      </div>
    </div>
  );
}
