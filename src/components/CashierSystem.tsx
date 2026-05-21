import React, { useState } from 'react';
import { Order, Table, OrderStatus, TableStatus } from '../types';
import { 
  DollarSign, 
  CreditCard, 
  Wallet, 
  Receipt, 
  ArrowRight,
  Sparkles,
  Percent,
  TrendingUp,
  LineChart,
  ShoppingBag,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';

interface CashierSystemProps {
  orders: Order[];
  tables: Table[];
  onProcessPayment: (orderId: string, paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia', tipAmount: number, discountPercentage: number) => void;
  selectedOrderIdFromProps: string | null;
  resetSelectedOrderId: () => void;
}

export default function CashierSystem({
  orders,
  tables,
  onProcessPayment,
  selectedOrderIdFromProps,
  resetSelectedOrderId
}: CashierSystemProps) {
  // Filter active accounts pending payment (status not 'pagado')
  const accountsToPay = orders.filter(o => o.status !== 'pagado');
  
  // Completed paid orders history
  const paidHistory = orders.filter(o => o.status === 'pagado');

  // Selected order state for active payment details
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(selectedOrderIdFromProps);

  // If props loaded, override
  React.useEffect(() => {
    if (selectedOrderIdFromProps) {
      setSelectedOrderId(selectedOrderIdFromProps);
      resetSelectedOrderId();
    }
  }, [selectedOrderIdFromProps, resetSelectedOrderId]);

  // Payment configuration options
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [tipOption, setTipOption] = useState<'none' | '10' | '15' | '20' | 'custom'>('10');
  const [customTip, setCustomTip] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Selected order lookup
  const currentInvoice = orders.find(o => o.id === selectedOrderId);

  // Calculations
  const subtotalPrice = currentInvoice ? currentInvoice.total : 0;
  
  const getTipValue = () => {
    if (tipOption === 'none') return 0;
    if (tipOption === '10') return subtotalPrice * 0.10;
    if (tipOption === '15') return subtotalPrice * 0.15;
    if (tipOption === '20') return subtotalPrice * 0.20;
    return parseFloat(customTip) || 0;
  };

  const tipAmount = getTipValue();
  const discountValue = subtotalPrice * (discountPercent / 100);
  const finalPrice = Math.max(0, subtotalPrice + tipAmount - discountValue);

  // Analytics
  const totalRevenue = paidHistory.reduce((acc, o) => acc + o.total, 0);
  const totalTransactions = paidHistory.length;
  const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  // Method shares
  const transactionsByMethod = paidHistory.reduce((acc, o) => {
    const method = o.paymentMethod || 'efectivo';
    acc[method] = (acc[method] || 0) + o.total;
    return acc;
  }, {} as Record<string, number>);

  const completedReceiptsCount = paidHistory.length;

  const handleCheckoutSubmit = () => {
    if (!currentInvoice) return;
    onProcessPayment(currentInvoice.id, paymentMethod, tipAmount, discountPercent);
    setSelectedOrderId(null);
    setTipOption('10');
    setCustomTip('');
    setDiscountPercent(0);
    alert(`¡Venta Registrada de manera exitosa! Cuenta procesada.`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Sales Dashboard / Analytics summary Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 shrink-0 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Caja y Registro de Ventas</h2>
          <p className="text-xs text-slate-500">Administra cuentas pendientes, cobra propinas, aplica descuentos y visualiza métricas diarias.</p>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-3 gap-4 xl:w-[600px] w-full">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3.5 items-center">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700/80 font-mono tracking-wider">Caja Total</span>
              <p className="text-lg font-black font-sans text-slate-900 leading-none mt-1">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3.5 items-center">
            <div className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-rose-700/80 font-mono tracking-wider">Tickets Hoy</span>
              <p className="text-lg font-black font-sans text-slate-900 leading-none mt-1">{totalTransactions}</p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3.5 items-center">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <LineChart className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-700/80 font-mono tracking-wider">Ticket Promedio</span>
              <p className="text-lg font-black font-sans text-slate-900 leading-none mt-1">${avgTicket.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main core layout grid: left column accounts list, right column active checkout */}
        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          
          {/* Quick graphical methods share bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs max-w-4xl mx-auto">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-4">Canales de Venta / Métodos de Pago</h3>
            <div className="space-y-3">
              <div className="flex rounded-xl overflow-hidden h-7 border border-slate-200">
                {['efectivo', 'tarjeta', 'transferencia'].map((m) => {
                  const shareVal = transactionsByMethod[m] || 0;
                  const ratio = totalRevenue > 0 ? (shareVal / totalRevenue) * 100 : 0;
                  
                  if (ratio === 0 && totalRevenue > 0) return null;
                  
                  const bgCol = m === 'efectivo' ? 'bg-emerald-500' : m === 'tarjeta' ? 'bg-indigo-500' : 'bg-amber-450';
                  
                  return (
                    <div 
                      key={m} 
                      className={`${bgCol} transition-all`} 
                      style={{ width: `${totalRevenue > 0 ? ratio : 33.3}%` }}
                      title={`${m}: $${shareVal}`}
                    />
                  );
                })}
              </div>

              {/* Legends */}
              <div className="flex flex-wrap gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Efectivo: <strong>${(transactionsByMethod['efectivo'] || 0).toFixed(2)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
                  <span className="text-slate-600">Tarjetas deb/cred: <strong>${(transactionsByMethod['tarjeta'] || 0).toFixed(2)}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                  <span className="text-slate-600">Transferencias: <strong>${(transactionsByMethod['transferencia'] || 0).toFixed(2)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Accounts pending checkout list */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Cuentas Pendientes por Cobrar</h3>
              
              <div className="space-y-3">
                {accountsToPay.map((accOrder) => {
                  const itemsCount = accOrder.items.reduce((s, i) => s + i.quantity, 0);
                  const relatedTable = tables.find(t => t.id === accOrder.tableId);
                  const isReady = relatedTable?.status === 'esperando_cuenta' || accOrder.status === 'listo';
                  
                  return (
                    <button
                      key={accOrder.id}
                      id={`pending-acc-${accOrder.id}`}
                      onClick={() => setSelectedOrderId(accOrder.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                        selectedOrderId === accOrder.id
                          ? 'border-emerald-600 bg-emerald-50/20 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-950 font-sans">Mesa {accOrder.tableNumber}</span>
                          {isReady && (
                            <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-md bg-amber-100 border border-amber-300 text-amber-800 animate-pulse">
                              Pide Cuenta
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-sans">
                          {itemsCount} platillos · Atendió: {accOrder.waiterName.split(' ')[0]}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm font-mono text-slate-900">${accOrder.total.toFixed(2)}</span>
                        <ArrowRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </button>
                  );
                })}

                {accountsToPay.length === 0 && (
                  <div className="p-8 border border-dashed border-slate-300 rounded-2xl bg-slate-100/50 text-center text-slate-450 text-xs font-sans">
                    No hay mesas con cuentas pendientes de cobro en este momento.
                  </div>
                )}
              </div>
            </div>

            {/* Historical completed invoice register logs */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Últimos Tickets Facturados</h3>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {paidHistory.map((historyOrder) => {
                  return (
                    <div key={historyOrder.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>Mesa {historyOrder.tableNumber}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                          <span className="font-mono text-[10px] text-slate-500 uppercase">{historyOrder.paymentMethod}</span>
                        </div>
                        <p className="text-slate-500 font-mono">
                          {new Date(historyOrder.paidTimestamp || historyOrder.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ID: {historyOrder.id.substring(0, 8)}
                        </p>
                      </div>

                      <span className="font-black font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ${historyOrder.total.toFixed(2)}
                      </span>
                    </div>
                  );
                })}

                {paidHistory.length === 0 && (
                  <div className="p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-100/30 text-center text-slate-400 text-xs">
                    El historial está vacío para el turno actual.
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Right drawer - Active Checkout calculation & ticket print preview */}
        <div className="w-[450px] border-l border-slate-200 bg-white shadow-xl flex flex-col shrink-0">
          {currentInvoice ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Checkout details Header */}
              <div className="p-6 border-b border-slate-100">
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block mb-1">Módulo de Transacción</span>
                <h3 className="text-lg font-bold text-slate-950 font-sans">
                  Cobrar Cuenta: Mesa {currentInvoice.tableNumber}
                </h3>
                <span className="text-xs text-slate-550 font-mono">Orden Ref: {currentInvoice.id.substring(0, 10)}</span>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-5">
                {/* Micro Ticket Receipt details breakdown */}
                <div className="border border-dashed border-slate-300 rounded-2xl p-4.5 bg-slate-50 font-mono text-xs space-y-3.5">
                  <div className="text-center pb-2.5 border-b border-dashed border-slate-300">
                    <h5 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-sans">RESTAURANTE COMFY</h5>
                    <p className="text-[10px] text-slate-500 mt-1">Ticket pre-pago para Mesa #{currentInvoice.tableNumber}</p>
                    <p className="text-[10px] text-slate-500">Fecha: {new Date(currentInvoice.timestamp).toLocaleDateString()}</p>
                  </div>

                  {/* Items loop */}
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                  {currentInvoice.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>{it.quantity}x {it.name.substring(0, 24)}</span>
                        <span>${(it.price * it.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Calculations breakdown */}
                  <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal consumido:</span>
                      <span>${subtotalPrice.toFixed(2)}</span>
                    </div>
                    {discountPercent > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Desc. aplicado ({discountPercent}%):</span>
                        <span>-${discountValue.toFixed(2)}</span>
                      </div>
                    )}
                    {tipAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Servicio/Propina añadida:</span>
                        <span>+${tipAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-2 flex justify-between text-sm font-black text-slate-900 border-t border-dashed border-slate-300">
                      <span>A pagar Neto:</span>
                      <span>${finalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Billing config variables */}
                {/* 1. Payment Method radio selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Método de Cobro Pago</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setPaymentMethod('efectivo')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 justify-center transition-all ${
                        paymentMethod === 'efectivo'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <DollarSign className="h-4 w-4" />
                      Efectivo
                    </button>
                    <button
                      onClick={() => setPaymentMethod('tarjeta')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 justify-center transition-all ${
                        paymentMethod === 'tarjeta'
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <CreditCard className="h-4 w-4" />
                      Tarjeta
                    </button>
                    <button
                      onClick={() => setPaymentMethod('transferencia')}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 justify-center transition-all ${
                        paymentMethod === 'transferencia'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <Wallet className="h-4 w-4" />
                      Transfer.
                    </button>
                  </div>
                </div>

                {/* 2. Customer Service Tips (%) */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Agregar Propina Sugerida</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {([
                      { id: 'none', label: '0%' },
                      { id: '10', label: '10%' },
                      { id: '15', label: '15%' },
                      { id: '20', label: '20%' },
                      { id: 'custom', label: 'Otro' }
                    ] as const).map((tOption) => (
                      <button
                        key={tOption.id}
                        onClick={() => setTipOption(tOption.id)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all truncate text-center ${
                          tipOption === tOption.id
                            ? 'bg-slate-800 text-white border-slate-800'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                        }`}
                      >
                        {tOption.label}
                      </button>
                    ))}
                  </div>

                  {tipOption === 'custom' && (
                    <div className="relative mt-2.5">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                      <input
                        id="custom-tip-input"
                        type="number"
                        placeholder="Monto de propina en pesos"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        className="w-full text-xs font-sans pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Discount (%) picker */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Ajustar Descuento Especial</label>
                  <div className="flex gap-2.5 items-center">
                    <div className="relative flex-1">
                      <select
                        id="discount-select"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                        className="w-full text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 appearance-none cursor-pointer"
                      >
                        <option value="0">Sin Descuento (0%)</option>
                        <option value="5">Cortesía Regular (5%)</option>
                        <option value="10">Descuento Empleado (10%)</option>
                        <option value="15">Socio / Aliado (15%)</option>
                        <option value="20">Patrocinador VIP (20%)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Payment button */}
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle className="h-4.5 w-4.5" />
                  Registrar Pago y Cerrar Mesa
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Receipt className="h-10 w-10 mb-2 text-slate-400 opacity-30" />
              <p className="text-sm font-sans">Selecciona una comanda de "Cuentas por Cobrar" de mesa activa para procesar la transacción.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
