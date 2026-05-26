import React, { useState } from 'react';
import { Order, OrderStatus, OrderItem } from '../types';
import { 
  ChefHat, 
  Clock, 
  CheckCheck, 
  Hourglass, 
  Sparkles,
  Play,
  CheckCircle,
  MessageSquare,
  UtensilsCrossed,
  BellRing,
  RotateCcw,
  ListTodo
} from 'lucide-react';

interface KitchenSystemProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onUpdateOrderItemStatus: (orderId: string, itemId: string, itemStatus: 'pendiente' | 'preparando' | 'listo') => void;
}

export default function KitchenSystem({
  orders,
  onUpdateOrderStatus,
  onUpdateOrderItemStatus
}: KitchenSystemProps) {
  // Tabs for the monitor kitchen board
  const [statusFilter, setStatusFilter] = useState<'activos' | 'pendiente' | 'preparando' | 'listo' | 'entregado'>('activos');

  // Grouped counts based on universal orders list
  const countPending = orders.filter(o => o.status === 'pendiente').length;
  const countPreparing = orders.filter(o => o.status === 'preparando').length;
  const countReady = orders.filter(o => o.status === 'listo').length;
  const countDelivered = orders.filter(o => o.status === 'entregado').length;
  const countActive = countPending + countPreparing + countReady;

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return 'bg-rose-500 text-white animate-pulse';
      case 'preparando':
        return 'bg-amber-500 text-slate-900 border border-amber-400';
      case 'listo':
        return 'bg-emerald-600 text-white';
      case 'entregado':
        return 'bg-indigo-600 text-white';
      default:
        return 'bg-slate-700 text-slate-100';
    }
  };

  const calculateMinutesElapsed = (timestampStr: string) => {
    const orderTime = new Date(timestampStr).getTime();
    const currTime = new Date().getTime();
    const diffMs = currTime - orderTime;
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  // Filter orders depending on active tab
  const displayedOrders = orders.filter(o => {
    if (statusFilter === 'activos') {
      return o.status === 'pendiente' || o.status === 'preparando' || o.status === 'listo';
    }
    return o.status === statusFilter;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* KDS Header */}
      <div className="px-8 py-5 shrink-0 bg-white border-b border-slate-200/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
            <ChefHat className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-905">Monitor de Cocina (KDS)</h2>
            <p className="text-xs text-slate-500 font-medium">Control en vivo de preparación, tiempos y estados de entrega.</p>
          </div>
        </div>

        {/* Dynamic Interactive Counter Tabs */}
        <div className="flex bg-slate-100 border border-slate-200 rounded-2xl p-1 gap-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setStatusFilter('activos')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap text-xs font-semibold ${
              statusFilter === 'activos' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'hover:bg-slate-200/80 text-slate-650'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-slate-700"></span>
            <span>Activos:</span>
            <span className="font-mono font-bold text-slate-950">{countActive}</span>
          </button>
          
          <button
            onClick={() => setStatusFilter('pendiente')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap text-xs font-semibold ${
              statusFilter === 'pendiente' 
                ? 'bg-rose-500 text-white font-bold shadow-sm' 
                : 'hover:bg-slate-200/80 text-slate-650'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>En Cola / Espera:</span>
            <span className="font-mono font-bold">{countPending}</span>
          </button>

          <button
            onClick={() => setStatusFilter('preparando')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap text-xs font-semibold ${
              statusFilter === 'preparando' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                : 'hover:bg-slate-200/80 text-slate-650'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-amber-550 animate-bounce"></span>
            <span>Cocinando:</span>
            <span className="font-mono font-bold text-slate-950">{countPreparing}</span>
          </button>

          <button
            onClick={() => setStatusFilter('listo')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap text-xs font-semibold ${
              statusFilter === 'listo' 
                ? 'bg-emerald-600 text-white font-bold shadow-sm' 
                : 'hover:bg-slate-200/80 text-slate-655'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Listo:</span>
            <span className="font-mono font-bold">{countReady}</span>
          </button>

          <button
            onClick={() => setStatusFilter('entregado')}
            className={`px-3.5 py-1.5 rounded-xl flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap text-xs font-semibold ${
              statusFilter === 'entregado' 
                ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                : 'hover:bg-slate-200/80 text-slate-655'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <span>Entregados:</span>
            <span className="font-mono font-bold">{countDelivered}</span>
          </button>
        </div>
      </div>

      {/* Tickets Board */}
      <div className="flex-1 p-8 overflow-x-auto overflow-y-hidden flex items-start gap-6 bg-slate-100/40">
        {displayedOrders.map((order) => {
          const mins = calculateMinutesElapsed(order.timestamp);
          const isOverdue = mins >= 15 && order.status !== 'entregado' && order.status !== 'listo'; // Warn if delay
          
          return (
            <div 
              key={order.id} 
              id={`kds-card-${order.id}`}
              className={`w-85 max-h-full rounded-3xl bg-white border shadow-md flex flex-col shrink-0 overflow-hidden ${
                isOverdue 
                  ? 'border-rose-450 ring-2 ring-rose-100 shadow-rose-50' 
                  : order.status === 'pendiente' 
                  ? 'border-indigo-150' 
                  : order.status === 'preparando' 
                  ? 'border-amber-250 ring-1 ring-amber-100/50' 
                  : order.status === 'listo'
                  ? 'border-emerald-350'
                  : 'border-slate-200 opacity-90'
              }`}
            >
              {/* Ticket Top Meta Details */}
              <div className={`p-4.5 border-b shrink-0 ${
                isOverdue ? 'bg-rose-50/60 border-rose-100' : 'bg-slate-50/70 border-slate-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-400">Comanda</span>
                    <h3 className="text-3xl font-black font-sans text-slate-800 leading-none mt-1">
                      Mesa {order.tableNumber}
                    </h3>
                  </div>
                  
                  {/* Status Banner */}
                  <span className={`text-[10px] font-black font-mono tracking-wider uppercase px-2.5 py-1.5 rounded-xl ${getOrderStatusBadge(order.status)}`}>
                    {order.status === 'pendiente' ? 'NUEVO' : order.status === 'preparando' ? 'COCINANDO' : order.status === 'listo' ? 'LISTO' : 'ENTREGADO'}
                  </span>
                </div>

                <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Mesero: <strong className="text-slate-700 font-semibold">{order.waiterName.split(' ')[0]}</strong></span>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold ${
                    isOverdue ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{mins} mins</span>
                  </div>
                </div>

                {order.customerName && (
                  <div className="mt-2.5 text-xs text-slate-600 font-sans tracking-wide truncate">
                    Comensal: <strong className="text-slate-800">{order.customerName}</strong>
                  </div>
                )}
              </div>

              {/* Global instructions comment box */}
              {order.notes && (
                <div className="px-4.5 py-2.5 bg-amber-50/80 border-b border-amber-100 flex gap-2 text-xs text-amber-800 font-sans shrink-0">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">"{order.notes}"</span>
                </div>
              )}

              {/* Items List inside Ticket */}
              <div className="flex-1 overflow-y-auto p-4.5 space-y-3 bg-white max-h-[360px]">
                {order.items.map((item, idx) => {
                  const itemStatus = item.status || 'pendiente';
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-2xl border transition-all ${
                        itemStatus === 'listo' 
                          ? 'bg-emerald-50/30 border-emerald-100 text-slate-400 line-through' 
                          : itemStatus === 'preparando' 
                          ? 'bg-amber-50/40 border-amber-150 text-slate-850 font-medium' 
                          : 'bg-slate-50/30 border-slate-150 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className={`h-6 w-6 font-mono font-black text-xs rounded-lg flex items-center justify-center shrink-0 ${
                            itemStatus === 'listo' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : itemStatus === 'preparando' 
                              ? 'bg-amber-400 text-slate-950' 
                              : 'bg-indigo-600 text-white'
                          }`}>
                            {item.quantity}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-xs font-sans font-bold leading-tight text-slate-800">
                              {item.name}
                            </span>
                            {/* Item status label */}
                            <span className={`text-[9px] font-mono font-bold mt-0.5 uppercase tracking-wide ${
                              itemStatus === 'listo' ? 'text-emerald-600' : itemStatus === 'preparando' ? 'text-amber-600' : 'text-slate-400'
                            }`}>
                              {itemStatus === 'listo' ? 'Listo ✔' : itemStatus === 'preparando' ? 'Preparando' : 'En espera'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Item level preparation instructions */}
                      {item.notes && (
                        <div className="mt-2 text-[11px] font-mono text-amber-700 pl-8.5 italic leading-snug">
                          ↳ Instrucción: {item.notes}
                        </div>
                      )}

                      {/* Dish level kitchen state selectors (full options) */}
                      <div className="mt-3 pl-8.5 flex flex-wrap gap-1">
                        {itemStatus !== 'pendiente' && (
                          <button
                            id={`item-pnd-${order.id}-${idx}`}
                            onClick={() => onUpdateOrderItemStatus(order.id, item.id, 'pendiente')}
                            className="text-[9.5px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg font-sans font-semibold cursor-pointer transition-colors"
                          >
                            Cola (Preparar)
                          </button>
                        )}
                        {itemStatus !== 'preparando' && (
                          <button
                            id={`item-prp-${order.id}-${idx}`}
                            onClick={() => onUpdateOrderItemStatus(order.id, item.id, 'preparando')}
                            className="text-[9.5px] bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 px-2.5 py-1 rounded-lg font-sans font-semibold cursor-pointer transition-colors"
                          >
                            Preparando...
                          </button>
                        )}
                        {itemStatus !== 'listo' && (
                          <button
                            id={`item-rdy-${order.id}-${idx}`}
                            onClick={() => onUpdateOrderItemStatus(order.id, item.id, 'listo')}
                            className="text-[9.5px] bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-lg font-sans font-bold cursor-pointer transition-colors"
                          >
                            Listo ✔
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General Bottom Ticket Actions (Interactive Grid for 4 States) */}
              <div className="p-4 border-t border-slate-150 bg-slate-50/80 flex flex-col gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono text-center">Control de Comanda Completa</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'pendiente')}
                    className={`py-2 px-2 text-[10px] rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                      order.status === 'pendiente'
                        ? 'bg-rose-500 border-rose-500 text-white shadow-sm font-extrabold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    Cola/Preparar
                  </button>

                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'preparando')}
                    className={`py-2 px-2 text-[10px] rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                      order.status === 'preparando'
                        ? 'bg-amber-500 border-amber-505 text-slate-950 shadow-sm font-extrabold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                    }`}
                  >
                    Preparando
                  </button>

                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'listo')}
                    className={`py-2 px-2.5 text-[10.5px] rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border col-span-2 ${
                      order.status === 'listo'
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm font-extrabold'
                        : 'bg-white border-emerald-100 hover:bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Listo para Servir
                  </button>

                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'entregado')}
                    className={`py-2 px-2.5 text-[10.5px] rounded-xl font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border col-span-2 ${
                      order.status === 'entregado'
                        ? 'bg-indigo-600 border-indigo-605 text-white shadow-sm font-extrabold'
                        : 'bg-white border-slate-200 hover:bg-indigo-50 text-indigo-750'
                    }`}
                  >
                    <UtensilsCrossed className="h-3.5 w-3.5" />
                    Entregado / Servido
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {displayedOrders.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-24 bg-white/40 rounded-3xl border border-dashed border-slate-300">
            <div className="p-4 bg-white rounded-full border border-slate-200 text-slate-400 mb-4 animate-pulse shadow-sm">
              <ChefHat className="h-12 w-12 text-slate-405" />
            </div>
            <h4 className="text-base font-bold text-slate-800">¡Bandeja sin comandas!</h4>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-medium leading-relaxed">
              No hay pedidos en cola con el estado seleccionado. Cambia el filtro arriba para revisar las comandas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
