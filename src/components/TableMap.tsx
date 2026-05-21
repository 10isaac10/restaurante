import React, { useState } from 'react';
import { Table, TableStatus, Order } from '../types';
import { 
  Users, 
  CheckCircle2, 
  UserMinus, 
  Armchair, 
  Receipt,
  PlusCircle,
  HelpCircle,
  Clock,
  MenuIcon
} from 'lucide-react';

interface TableMapProps {
  tables: Table[];
  orders: Order[];
  onUpdateTableStatus: (tableId: string, status: TableStatus, reservationName?: string) => void;
  onSelectTableForOrder: (tableId: string) => void;
  onGoToCheckout: (orderId: string) => void;
}

export default function TableMap({
  tables,
  orders,
  onUpdateTableStatus,
  onSelectTableForOrder,
  onGoToCheckout
}: TableMapProps) {
  const [selectedTableId, setSelectedTableId] = useState<string | null>(tables[0]?.id || null);

  const selectedTable = tables.find(t => t.id === selectedTableId);
  const activeOrder = selectedTable && selectedTable.currentOrderId 
    ? orders.find(o => o.id === selectedTable.currentOrderId) 
    : null;

  const getStatusMeta = (status: TableStatus) => {
    switch (status) {
      case 'libre':
        return {
          label: 'Libre',
          bgColor: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70',
          textColor: 'text-emerald-800',
          dotColor: 'bg-emerald-500',
          badgeStyle: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'ocupada':
        return {
          label: 'Ocupada',
          bgColor: 'bg-rose-50 border-rose-200 hover:bg-rose-100/70',
          textColor: 'text-rose-800',
          dotColor: 'bg-rose-500',
          badgeStyle: 'bg-rose-100 text-rose-805 border-rose-200'
        };
      case 'reservada':
        return {
          label: 'Reservada',
          bgColor: 'bg-amber-50 border-amber-200 hover:bg-amber-100/70',
          textColor: 'text-amber-800',
          dotColor: 'bg-amber-500',
          badgeStyle: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'esperando_cuenta':
        return {
          label: 'Pide Cuenta',
          bgColor: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100/70 animate-pulse',
          textColor: 'text-indigo-805',
          dotColor: 'bg-indigo-500',
          badgeStyle: 'bg-indigo-100 text-indigo-805 border-indigo-200'
        };
      default:
        return {
          label: 'Desconocido',
          bgColor: 'bg-slate-50 border-slate-200',
          textColor: 'text-slate-800',
          dotColor: 'bg-slate-500',
          badgeStyle: 'bg-slate-100 text-slate-800 border-slate-200'
        };
    }
  };

  const statusCounts = tables.reduce((acc, current) => {
    acc[current.status] = (acc[current.status] || 0) + 1;
    return acc;
  }, {} as Record<TableStatus, number>);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Top action header */}
      <div className="bg-white border-b border-gray-200 shrink-0 px-8 h-20 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Control de Mesas</h2>
          <p className="text-xs text-slate-450 font-medium uppercase tracking-widest">Planta Baja • Monitor de Salón</p>
        </div>
        
        {/* State counters indicators */}
        <div className="flex gap-4">
          {(['libre', 'ocupada', 'esperando_cuenta', 'reservada'] as TableStatus[]).map((st) => {
            const meta = getStatusMeta(st);
            return (
              <div key={st} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs">
                <span className={`h-2.5 w-2.5 rounded-full ${meta.dotColor}`}></span>
                <span className="font-sans font-medium text-slate-700">
                  {meta.label}: <strong className="font-mono text-slate-900">{statusCounts[st] || 0}</strong>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Interactive map */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-slate-500 tracking-wider uppercase mb-6 font-mono">Mapa de Mesas</h3>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {tables.map((table) => {
                const isSelected = table.id === selectedTableId;
                const meta = getStatusMeta(table.status);
                
                return (
                  <button
                    key={table.id}
                    id={`table-card-${table.number}`}
                    onClick={() => setSelectedTableId(table.id)}
                    className={`h-40 relative rounded-2xl border p-5 flex flex-col justify-between text-left transition-all ${meta.bgColor} ${
                      isSelected 
                        ? 'ring-3 ring-indigo-500/20 border-indigo-500 shadow-md' 
                        : 'border-slate-200/70 shadow-sm'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`text-xs px-2.5 py-1 rounded-full border ${meta.badgeStyle} font-sans font-medium`}>
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-400 font-mono text-xs font-semibold bg-white/75 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-100">
                        <Users className="h-3.5 w-3.5 text-slate-500" />
                        <span>{table.capacity}</span>
                      </div>
                    </div>

                    <div className="text-center py-2">
                       <span className="text-3xl font-bold text-slate-800 tracking-tight font-sans">
                        Mesa {table.number}
                       </span>
                       {table.status === 'reservada' && table.reservationName && (
                         <span className="block text-xs text-amber-700 font-semibold mt-1 truncate max-w-full px-2">
                           {table.reservationName}
                         </span>
                       )}
                    </div>

                    {/* Order summary ticker if applicable */}
                    {table.currentOrderId && activeOrder && (
                      <div className="flex justify-between items-center bg-white/60 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-dashed border-slate-300/60 text-xs font-mono">
                        <span className="text-slate-500">Total:</span>
                        <span className="font-bold text-slate-800">${activeOrder.total.toFixed(2)}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected table side drawer */}
        <div className="w-96 border-l border-slate-200 bg-white shadow-xl flex flex-col shrink-0">
          {selectedTable ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Table details header */}
              <div className="p-6 border-b border-slate-105">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block mb-1">Detalles de la ubicación</span>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-2xl font-bold text-slate-900 font-sans">Mesa {selectedTable.number}</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-sans font-medium ${getStatusMeta(selectedTable.status).badgeStyle}`}>
                    {getStatusMeta(selectedTable.status).label}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span>Capacidad: {selectedTable.capacity} comensales</span>
                  </div>
                </div>

                {selectedTable.status === 'reservada' && (
                  <div className="mt-4 p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl space-y-2">
                    <label className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">Nombre de Reservación</label>
                    <input
                      id="table-reservation-name-input"
                      type="text"
                      placeholder="Ej. Familia Pérez"
                      value={selectedTable.reservationName || ''}
                      onChange={(e) => onUpdateTableStatus(selectedTable.id, 'reservada', e.target.value)}
                      className="w-full bg-white border border-amber-200 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-200 font-medium"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic State Actions panel */}
              <div className="p-6 border-b border-indigo-50/40 bg-slate-50 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Cambiar Estado Manualmente</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onUpdateTableStatus(selectedTable.id, 'libre')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 justify-center ${
                      selectedTable.status === 'libre'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white hover:bg-slate-105 text-slate-700 border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Libre
                  </button>
                  <button
                    onClick={() => onUpdateTableStatus(selectedTable.id, 'reservada')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 justify-center ${
                      selectedTable.status === 'reservada'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white hover:bg-slate-105 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Reservada
                  </button>
                  <button
                    onClick={() => onUpdateTableStatus(selectedTable.id, 'ocupada')}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all col-span-2 flex items-center gap-1.5 justify-center ${
                      selectedTable.status === 'ocupada'
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white hover:bg-slate-105 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Armchair className="h-3.5 w-3.5" />
                    Ocupada (Sin Pedido)
                  </button>
                </div>
              </div>

              {/* Table active billing/order display */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {selectedTable.currentOrderId && activeOrder ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Pedido Activo: {activeOrder.id.substring(0, 8)}</h4>
                      <span className="text-[11px] font-mono text-slate-400">{new Date(activeOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="text-xs font-sans text-slate-600">
                        Atendido por: <strong className="text-slate-800">{activeOrder.waiterName}</strong>
                      </div>

                      {/* Items list summary */}
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {activeOrder.items.map((it, idx) => (
                           <div key={idx} className="flex justify-between text-xs font-mono">
                            <span className="text-slate-600">{it.quantity}x {it.name}</span>
                            <span className="text-slate-800 font-medium">${(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-xs font-sans text-slate-605">Total:</span>
                        <span className="text-base font-bold text-slate-950 font-sans">${activeOrder.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Operational Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => onSelectTableForOrder(selectedTable.id)}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Añadir o Editar Comanda
                      </button>
                      
                      <button
                        onClick={() => onGoToCheckout(activeOrder.id)}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <Receipt className="h-4 w-4" />
                        Proceder al Cobro / Ticket
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-3">
                      <Armchair className="h-8 w-8" />
                    </div>
                    <h5 className="text-sm font-semibold text-slate-700 font-sans">Mesa disponible</h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                      Esta mesa está actualmente desocupada o lista para nuevos comensales.
                    </p>
                    <button
                      onClick={() => {
                        // Mark as occupied and launch order pad
                        onUpdateTableStatus(selectedTable.id, 'ocupada');
                        onSelectTableForOrder(selectedTable.id);
                      }}
                      className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 text-white font-medium text-xs rounded-lg transition-all"
                    >
                      Tomar Pedido de Entrada
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Armchair className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm font-sans">Selecciona una mesa en el mapa para ver sus detalles y controles.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
