import React, { useState } from 'react';
import { Customer } from '../types';
import { 
  Contact, 
  Search, 
  PlusCircle, 
  Smile, 
  HelpCircle,
  TrendingUp,
  Mail,
  Phone,
  Bookmark,
  UserCheck
} from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'visits' | 'totalSpent'>) => void;
}

export default function CustomerManager({
  customers,
  onAddCustomer
}: CustomerManagerProps) {
  // New customer search state
  const [custSearchQuery, setCustSearchQuery] = useState<string>('');

  // New customer registration form state
  const [custName, setCustName] = useState<string>('');
  const [custPhone, setCustPhone] = useState<string>('');
  const [custEmail, setCustEmail] = useState<string>('');
  const [custNotes, setCustNotes] = useState<string>('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim()) {
      alert('Ingresa el nombre del cliente.');
      return;
    }

    onAddCustomer({
      name: custName,
      phone: custPhone || 'No registrado',
      email: custEmail || 'No registrado',
      notes: custNotes || undefined
    });

    setCustName('');
    setCustPhone('');
    setCustEmail('');
    setCustNotes('');
    alert(`Cliente "${custName}" añadido a la base CRM.`);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(custSearchQuery.toLowerCase()) ||
    c.phone.includes(custSearchQuery)
  );

  return (
    <div className="flex-1 flex bg-slate-50 overflow-hidden">
      {/* Left panel body content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        
        {/* CRM search bar & title */}
        <div className="p-6 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Directorio de Clientes (CRM)</h2>
              <p className="text-xs text-slate-505">Consulta alergias de clientes recurrentes, visitas acumuladas e historial de consumo.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="customer-crm-search"
                type="text"
                placeholder="Buscar cliente por nombre..."
                value={custSearchQuery}
                onChange={(e) => setCustSearchQuery(e.target.value)}
                className="w-full text-xs font-sans pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Customer Directory List */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {filteredCustomers.map((c) => {
              const isVIP = c.visits >= 10;
              return (
                <div 
                  key={c.id} 
                  id={`customer-crm-card-${c.id}`}
                  className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 font-sans flex items-center gap-1.5">
                          <span>{c.name}</span>
                          {isVIP && (
                            <Smile className="h-4.5 w-4.5 text-amber-500 fill-amber-100" title="Cliente VIP Frecuente" />
                          )}
                        </h4>
                        <span className="text-[10px] uppercase font-bold text-slate-405 font-mono tracking-wider">Perfil Registrado</span>
                      </div>

                      {/* Stat summary counters pills */}
                      <span className={`text-[10px] font-black font-mono tracking-wider uppercase px-2 py-0.5 rounded-full ${
                        isVIP ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        Visitas: {c.visits}
                      </span>
                    </div>

                    {/* Contacts info row */}
                    <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{c.email}</span>
                      </div>
                      
                      {/* Customer preferences notes box */}
                      {c.notes && (
                        <div className="mt-2 text-xs bg-indigo-50/40 border border-slate-200 p-2.5 rounded-xl text-slate-700 font-sans flex gap-1.5 leading-snug">
                          <Bookmark className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>Preferencias: <strong className="text-slate-800">{c.notes}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lifespan consumption total metrics value */}
                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-sans">Consumo Acumulado:</span>
                    <strong className="font-mono text-sm text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      ${c.totalSpent.toFixed(2)}
                    </strong>
                  </div>
                </div>
              );
            })}

            {filteredCustomers.length === 0 && (
              <div className="col-span-2 py-20 text-center">
                <Smile className="h-10 w-10 text-slate-350 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-slate-400">No se encontraron clientes registrados con ese criterio de búsqueda.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column CRM registration form details */}
      <div className="w-96 border-l border-slate-200 bg-white shadow-xl flex flex-col shrink-0 p-6 overflow-y-auto">
        <div className="border-b border-slate-100 pb-5 mb-5 shrink-0">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block mb-1">CRM Registros</span>
          <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-1.5">
            <UserCheck className="h-4.5 w-4.5 text-emerald-500" />
            <span>Afiliar Huésped</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">Registra las preferencias, mesas preferidas, o intolerancias de los comensales.</p>
        </div>

        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Nombre Completo *</label>
            <input
              id="new-customer-name"
              type="text"
              placeholder="Ej. Juan Pérez Garza"
              value={custName}
              onChange={(e) => setCustName(e.target.value)}
              className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Teléfono Móvil *</label>
            <input
              id="new-customer-phone"
              type="text"
              placeholder="Ej. 551-555-0199"
              value={custPhone}
              onChange={(e) => setCustPhone(e.target.value)}
              className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Email Electrónico *</label>
            <input
              id="new-customer-email"
              type="email"
              placeholder="Ej. juan.perez@direct.com"
              value={custEmail}
              onChange={(e) => setCustEmail(e.target.value)}
              className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">Notas / Restricciones / Alergias *</label>
            <textarea
              id="new-customer-notes"
              rows={3}
              placeholder="Ej. Intolerante a la lactosa, prefiere mesa en balcón exterior"
              value={custNotes}
              onChange={(e) => setCustNotes(e.target.value)}
              className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:bg-white focus:ring-0 focus:outline-none resize-none"
            />
            <span className="text-[10px] text-slate-400 font-mono mt-1 block">Aparecerán automáticamente al tomar pedidos.</span>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide uppercase rounded-xl transition-all shadow-md cursor-pointer"
          >
            Guardar en Directorio
          </button>
        </form>
      </div>
    </div>
  );
}
