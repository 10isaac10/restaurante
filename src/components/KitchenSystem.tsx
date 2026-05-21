import React from 'react';
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
  BellRing
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
  // We only see orders that are in kitchen queue: 'pendiente', 'preparando', 'listo'
  const activeOrders = orders.filter(o => 
    o.status === 'pendiente' || 
    o.status === 'preparando' || 
    o.status === 'listo'
  );

  // Grouped counts
  const pendingCount = activeOrders.filter(o => o.status === 'pendiente').length;
  const preparingCount = activeOrders.filter(o => o.status === 'preparando').length;
  const readyCount = activeOrders.filter(o => o.status === 'listo').length;

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return 'bg-rose-500 text-white animate-pulse';
      case 'preparando':
        return 'bg-amber-500 text-slate-900';
      case 'listo':
        return 'bg-emerald-600 text-white';
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

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 text-slate-800 overflow-hidden">
      {/* KDS Header */}
      <div className="px-8 py-5 shrink-0 bg-white border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
            <ChefHat className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-sans tracking-tight text-slate-900 font-sans">Monitor de Cocina (KDS)</h2>
            <p className="text-xs text-slate-500 font-medium">Control de cola de preparación de platillos y postres en vivo.</p>
          </div>
        </div>

        {/* Dynamic Ticket Counters */}
        <div className="flex bg-slate-50 border border-slate-200 rounded-2xl p-1 gap-1">
          <div className="px-3.5 py-1.5 rounded-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-sans text-slate-450 font-medium">Pendiente: </span>
            <span className="text-xs font-mono font-bold text-rose-600">{pendingCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl flex items-center gap-2 border-l border-slate-200/60">
            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
            <span className="text-xs font-sans text-slate-450 font-medium">Cocinando: </span>
            <span className="text-xs font-mono font-bold text-amber-600">{preparingCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl flex items-center gap-2 border-l border-slate-200/60 bg-white shadow-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-sans text-slate-705 font-medium">Listo: </span>
            <span className="text-xs font-mono font-bold text-emerald-600">{readyCount}</span>
          </div>
        </div>
      </div>

      {/* Tickets Board */}
      <div className="flex-1 p-8 overflow-x-auto overflow-y-hidden flex items-start gap-6 bg-slate-100/40">
        {activeOrders.map((order) => {
          const mins = calculateMinutesElapsed(order.timestamp);
          const isOverdue = mins >= 15; // Warn if more than 15 mins
          
          return (
            <div 
              key={order.id} 
              id={`kds-card-${order.id}`}
              className={`w-80 max-h-full rounded-3xl bg-white border shadow-md flex flex-col shrink-0 ${
                isOverdue 
                  ? 'border-rose-455 shadow-rose-100' 
                  : order.status === 'pendiente' 
                  ? 'border-indigo-200' 
                  : order.status === 'preparando' 
                  ? 'border-amber-300' 
                  : 'border-emerald-400'
              }`}
            >
              {/* Ticket Top Meta Details */}
              <div className={`p-4 border-b rounded-t-[22px] ${
                isOverdue ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50/70 border-slate-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider font-mono text-slate-400">Mesa</span>
                    <h3 className="text-3xl font-black font-sans text-slate-800 leading-none mt-1">
                      #{order.tableNumber}
                    </h3>
                  </div>
                  
                  {/* Status Banner */}
                  <span className={`text-[10px] font-black font-mono tracking-wider uppercase px-2.5 py-1 rounded-md ${getOrderStatusBadge(order.status)}`}>
                    {order.status === 'pendiente' ? 'NUEVO' : order.status === 'preparando' ? 'COCINANDO' : 'LISTO'}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>Atiende: {order.waiterName.split(' ')[0]}</span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md font-bold ${
                    isOverdue ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Clock className="h-3.5 w-3.5" />
                    <span>{mins}m</span>
                  </div>
                </div>

                {order.customerName && (
                  <div className="mt-2 text-xs text-slate-600 font-sans tracking-wide truncate">
                    Cliente: <strong className="text-slate-800">{order.customerName}</strong>
                  </div>
                )}
              </div>

              {/* Global instructions comment box */}
              {order.notes && (
                <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100 flex gap-2 text-xs text-amber-800 font-sans">
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{order.notes}</span>
                </div>
              )}

              {/* Items List inside Ticket */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
                {order.items.map((item, idx) => {
                  const itemStatus = item.status || 'pendiente';
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-xl border transition-all ${
                        itemStatus === 'listo' 
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through animate-fade-in' 
                          : itemStatus === 'preparando' 
                          ? 'bg-amber-50/60 border-amber-200 text-slate-800 font-medium' 
                          : 'bg-slate-50/30 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`h-6 w-6 font-mono font-black text-xs rounded-md flex items-center justify-center shrink-0 ${
                            itemStatus === 'listo' 
                              ? 'bg-slate-200 text-slate-400' 
                              : itemStatus === 'preparando' 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-indigo-650 text-white'
                          }`}>
                            {item.quantity}
                          </span>
                          <span className="text-xs font-sans font-bold leading-tight">
                            {item.name}
                          </span>
                        </div>
                      </div>

                      {/* Item level preparation instructions */}
                      {item.notes && (
                        <div className="mt-2 text-[11px] font-mono text-amber-700 pl-8 italic">
                          ↳ {item.notes}
                        </div>
                      )}

                      {/* Dish level kitchen state selectors */}
                      {order.status !== 'listo' && (
                        <div className="mt-3 pl-8 flex gap-1.5">
                          {itemStatus === 'pendiente' && (
                            <button
                              id={`item-prep-${order.id}-${idx}`}
                              onClick={() => onUpdateOrderItemStatus(order.id, item.id, 'preparando')}
                              className="text-[10px] bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-750 px-2.5 py-1 rounded-md font-sans font-bold cursor-pointer transition-all"
                            >
                              Comenzar
                            </button>
                          )}
                          {itemStatus === 'preparando' && (
                            <button
                              id={`item-ready-${order.id}-${idx}`}
                              onClick={() => onUpdateOrderItemStatus(order.id, item.id, 'listo')}
                              className="text-[10px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-750 px-2.5 py-1 rounded-md font-sans font-bold cursor-pointer transition-all"
                            >
                              Listo ✔
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* General Bottom Ticket Actions */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2 rounded-b-3xl">
                {order.status === 'pendiente' && (
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'preparando')}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current outline-none" />
                    Atender Comanda Completa
                  </button>
                )}

                {order.status === 'preparando' && (
                  <button
                    onClick={() => {
                      // Mark complete
                      onUpdateOrderStatus(order.id, 'listo');
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-555 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Comanda Lista para Entrega
                  </button>
                )}

                {order.status === 'listo' && (
                  <button
                    onClick={() => onUpdateOrderStatus(order.id, 'entregado')}
                    className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-705 font-bold text-xs rounded-xl transition-all border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    Confirmar En Mesa (Mesero)
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {activeOrders.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="p-4 bg-white rounded-full border border-slate-200 text-slate-400 mb-4 animate-bounce shadow-xs">
              <ChefHat className="h-12 w-12 text-slate-500" />
            </div>
            <h4 className="text-base font-bold text-slate-800">¡Cocina Limpia!</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
              No hay pedidos en cola en este momento. Las comandas enviadas por los meseros aparecerán aquí de inmediato.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
