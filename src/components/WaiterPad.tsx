import React, { useState, useEffect } from 'react';
import { Table, MenuItem, Ingredient, Staff, Order, OrderItem } from '../types';
import { 
  Users, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Tags
} from 'lucide-react';

interface WaiterPadProps {
  tables: Table[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  staff: Staff[];
  orders: Order[];
  onSubmitOrder: (order: Omit<Order, 'id'>) => void;
  selectedTableIdFromProps: string | null;
  resetSelectedTableId: () => void;
  currentUser: Staff | null;
}

export default function WaiterPad({
  tables,
  menuItems,
  ingredients,
  staff,
  orders,
  onSubmitOrder,
  selectedTableIdFromProps,
  resetSelectedTableId,
  currentUser
}: WaiterPadProps) {
  // Find active waiters
  const waiters = staff.filter(s => s.role === 'mesero' && s.status === 'activo');
  
  // Selected waiter & table
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedWaiterId, setSelectedWaiterId] = useState<string>(() => {
    if (currentUser && currentUser.role === 'mesero') {
      return currentUser.id;
    }
    return waiters[0]?.id || '';
  });
  const [customerName, setCustomerName] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');

  // Selected items cart
  const [cart, setCart] = useState<{ menuItem: MenuItem; quantity: number; notes: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'todos' | 'alimentos' | 'bebidas' | 'postres'>('todos');

  // Lock waiter ID to the currentUser if they are indeed a waiter
  useEffect(() => {
    if (currentUser && currentUser.role === 'mesero') {
      setSelectedWaiterId(currentUser.id);
    }
  }, [currentUser]);

  // Load table from props if any clicked from the table map
  useEffect(() => {
    if (selectedTableIdFromProps) {
      setSelectedTableId(selectedTableIdFromProps);
      
      // If table already has an active order, load its items into the cart to allow editing
      const existingTable = tables.find(t => t.id === selectedTableIdFromProps);
      if (existingTable && existingTable.currentOrderId) {
        const activeOrder = orders.find(o => o.id === existingTable.currentOrderId);
        if (activeOrder) {
          setSelectedWaiterId(activeOrder.waiterId);
          setCustomerName(activeOrder.customerName || '');
          setOrderNotes(activeOrder.notes || '');
          
          const loadedCart = activeOrder.items.map(item => {
            const mItem = menuItems.find(mi => mi.name === item.name) || {
              id: item.id,
              name: item.name,
              price: item.price,
              category: 'alimentos' as const,
              ingredients: [],
              color: 'bg-slate-100 text-slate-800'
            };
            return {
              menuItem: mItem,
              quantity: item.quantity,
              notes: item.notes || ''
            };
          });
          setCart(loadedCart);
        }
      } else {
        setCart([]);
        setCustomerName('');
        setOrderNotes('');
      }
      resetSelectedTableId();
    }
  }, [selectedTableIdFromProps, tables, orders, menuItems, resetSelectedTableId]);

  // Handle changing table picker
  const handleTableChange = (tableId: string) => {
    setSelectedTableId(tableId);
    setCart([]);
    setCustomerName('');
    setOrderNotes('');

    const targetTable = tables.find(t => t.id === tableId);
    if (targetTable && targetTable.currentOrderId) {
      const activeOrder = orders.find(o => o.id === targetTable.currentOrderId);
      if (activeOrder) {
        setSelectedWaiterId(activeOrder.waiterId);
        setCustomerName(activeOrder.customerName || '');
        setOrderNotes(activeOrder.notes || '');
        
        const loadedCart = activeOrder.items.map(item => {
          const mItem = menuItems.find(mi => mi.name === item.name) || {
            id: item.id,
            name: item.name,
            price: item.price,
            category: 'alimentos' as const,
            ingredients: [],
            color: 'bg-slate-100 text-slate-800 border-slate-300'
          };
          return {
            menuItem: mItem,
            quantity: item.quantity,
            notes: item.notes || ''
          };
        });
        setCart(loadedCart);
      }
    }
  };

  // Check ingredient stocks
  const checkStockForCartItem = (menuItem: MenuItem, incrementQty: number = 1): { canAdd: boolean; missingIngredients: string[] } => {
    const missing: string[] = [];

    // Aggregate requirements from existing cart + candidate
    const itemReqs: Record<string, number> = {};
    cart.forEach(item => {
      item.menuItem.ingredients.forEach(ing => {
        itemReqs[ing.ingredientId] = (itemReqs[ing.ingredientId] || 0) + (ing.quantity * item.quantity);
      });
    });

    // Add candidate
    menuItem.ingredients.forEach(ing => {
      itemReqs[ing.ingredientId] = (itemReqs[ing.ingredientId] || 0) + (ing.quantity * incrementQty);
    });

    // Assert with inventory stock
    Object.keys(itemReqs).forEach(ingId => {
      const dbIng = ingredients.find(i => i.id === ingId);
      if (!dbIng) return;
      if (dbIng.stock < itemReqs[ingId]) {
        missing.push(`${dbIng.name} (Requerido: ${itemReqs[ingId].toFixed(2)} ${dbIng.unit}, Disponible: ${dbIng.stock} ${dbIng.unit})`);
      }
    });

    return {
      canAdd: missing.length === 0,
      missingIngredients: missing
    };
  };

  const handleAddToCart = (menuItem: MenuItem) => {
    const existingIndex = cart.findIndex(item => item.menuItem.id === menuItem.id);
    const check = checkStockForCartItem(menuItem, 1);

    if (!check.canAdd) {
      alert(`Inventario Insuficiente para agregar este plato:\n- ${check.missingIngredients.join('\n- ')}`);
      return;
    }

    if (existingIndex !== -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { menuItem, quantity: 1, notes: '' }]);
    }
  };

  const handleUpdateQty = (index: number, delta: number) => {
    const item = cart[index];
    if (delta > 0) {
      const check = checkStockForCartItem(item.menuItem, 1);
      if (!check.canAdd) {
        alert(`Inventario Insuficiente:\n- ${check.missingIngredients.join('\n- ')}`);
        return;
      }
    }

    const updated = [...cart];
    updated[index].quantity += delta;
    if (updated[index].quantity <= 0) {
      updated.splice(index, 1);
    }
    setCart(updated);
  };

  const handleUpdateItemNotes = (index: number, notes: string) => {
    const updated = [...cart];
    updated[index].notes = notes;
    setCart(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  const total = cart.reduce((acc, c) => acc + (c.menuItem.price * c.quantity), 0);

  const handleSendOrder = () => {
    if (!selectedTableId) {
      alert('Por favor selecciona una mesa.');
      return;
    }
    if (!selectedWaiterId) {
      alert('Por favor selecciona un mesero.');
      return;
    }
    if (cart.length === 0) {
      alert('Agrega platillos a la comanda antes de enviarla.');
      return;
    }

    const waiterRecord = staff.find(s => s.id === selectedWaiterId);
    const tableRecord = tables.find(t => t.id === selectedTableId);

    if (!tableRecord || !waiterRecord) return;

    const orderItems: OrderItem[] = cart.map(item => ({
      id: item.menuItem.id,
      name: item.menuItem.name,
      price: item.menuItem.price,
      quantity: item.quantity,
      notes: item.notes,
      status: 'pendiente'
    }));

    onSubmitOrder({
      tableId: selectedTableId,
      tableNumber: tableRecord.number,
      waiterId: selectedWaiterId,
      waiterName: waiterRecord.name,
      items: orderItems,
      status: 'pendiente',
      total: total,
      notes: orderNotes,
      timestamp: new Date().toISOString(),
      customerName: customerName || undefined
    });

    // Reset fields
    setCart([]);
    setCustomerName('');
    setSelectedTableId('');
    setOrderNotes('');
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'todos' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex bg-slate-100 overflow-hidden">
      {/* Menu selection panel */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Subheader Filters */}
        <div className="p-6 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Comandero de Mesas</h2>
              <p className="text-xs text-slate-500">Agrega platillos y bebidas para enviar directamente a la cocina.</p>
            </div>

            {/* Selector de Mesero y Mesa */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <User className="h-4 w-4 text-slate-500" />
                <select
                  id="waiter-select"
                  value={selectedWaiterId}
                  disabled={currentUser?.role === 'mesero'}
                  onChange={(e) => setSelectedWaiterId(e.target.value)}
                  className={`bg-transparent border-none text-xs text-slate-800 font-sans font-medium focus:ring-0 leading-none py-1 cursor-pointer ${currentUser?.role === 'mesero' ? 'opacity-80' : ''}`}
                >
                  <option value="">-- Seleccionar Mesero --</option>
                  {waiters.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <Users className="h-4 w-4 text-slate-500" />
                <select
                  id="table-select"
                  value={selectedTableId}
                  onChange={(e) => handleTableChange(e.target.value)}
                  className="bg-transparent border-none text-xs text-slate-800 font-sans font-medium focus:ring-0 leading-none py-1 cursor-pointer"
                >
                  <option value="">-- Seleccionar Mesa --</option>
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>
                      Mesa {t.number} ({t.status === 'libre' ? 'Libre' : t.status === 'esperando_cuenta' ? 'Pide Cuenta' : 'Ocupada'})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Customer Loyalty & Client Linking */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Nombre Comensal / Cliente</label>
              <input
                id="customer-name-input"
                type="text"
                placeholder="Ej. Juan Pérez (Registro opcional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full text-xs font-sans bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-1">Notas globales de la comanda</label>
              <input
                id="global-notes-input"
                type="text"
                placeholder="Ej. Entregar postres al final, cuenta separada"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="w-full text-xs font-sans bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Menu Grid and Category Filter */}
        <div className="p-6 shrink-0 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories select pills */}
          <div className="flex gap-2.5 overflow-x-auto">
            {([
              { id: 'todos', label: 'Todos' },
              { id: 'alimentos', label: 'Alimentos' },
              { id: 'bebidas', label: 'Bebidas/Bar' },
              { id: 'postres', label: 'Postres' }
            ] as const).map((cat) => (
              <button
                key={cat.id}
                id={`category-btn-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all truncate ${
                  activeCategory === cat.id
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-650'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search field */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="menu-search"
              type="text"
              placeholder="Buscar platillo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200/80 rounded-full text-slate-800 placeholder-slate-400 focus:bg-white"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMenuItems.map((item) => {
              // Quick alert check
              const isLowStockInSomeWay = item.ingredients.some(ing => {
                const dbIng = ingredients.find(i => i.id === ing.ingredientId);
                return dbIng && dbIng.stock < ing.quantity;
              });

              return (
                <button
                  key={item.id}
                  id={`menu-item-card-${item.id}`}
                  onClick={() => handleAddToCart(item)}
                  disabled={isLowStockInSomeWay}
                  className={`border rounded-2xl p-4 flex flex-col justify-between text-left transition-all ${item.color} ${
                    isLowStockInSomeWay 
                      ? 'opacity-40 cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400' 
                      : 'hover:scale-102 hover:shadow-md cursor-pointer border-indigo-100'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs uppercase font-bold tracking-wide font-mono opacity-65">
                        {item.category === 'alimentos' ? 'Comida' : item.category === 'bebidas' ? 'Bebida' : 'Postre'}
                      </span>
                      {isLowStockInSomeWay && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-full font-sans uppercase">
                          <AlertCircle className="h-2.5 w-2.5" /> AGOTADO
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold mt-1.5 font-sans leading-tight">
                      {item.name}
                    </h4>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <span className="text-base font-bold font-mono">
                      ${item.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-sans bg-white/70 px-2 py-0.5 rounded-lg border border-slate-200/40 text-slate-500 font-medium">
                      + Agregar
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredMenuItems.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center">
              <Tags className="h-8 w-8 text-slate-350 mb-2" />
              <p className="text-xs text-slate-400 font-sans">No se encontraron productos coincidentes.</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Right Drawer */}
      <div className="w-[420px] bg-indigo-950/20 shadow-xl border-l border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono block mb-1">Resumen de Comanda</span>
          <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center justify-between">
            <span>Comanda Actual</span>
            {selectedTableId && (
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Mesa {tables.find(t => t.id === selectedTableId)?.number}
              </span>
            )}
          </h3>
        </div>

        {/* Selected table warning/indicator */}
        {!selectedTableId && (
          <div className="m-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex gap-3 text-xs text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <strong className="font-semibold block mb-0.5">Asignación Requerida</strong>
              Debes seleccionar una mesa en los selectores del encabezado para poder guardar y enviar la orden a la cocina.
            </div>
          </div>
        )}

        {/* Real-time Order Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length > 0 ? (
            <div className="space-y-3.5">
              {cart.map((cartItem, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="text-xs font-bold text-slate-900 font-sans leading-snug block">
                        {cartItem.menuItem.name}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        ${cartItem.menuItem.price.toFixed(2)} c/u
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Qty selectors */}
                  <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cantidad</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => handleUpdateQty(idx, -1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="text-sm font-bold font-mono text-slate-900">{cartItem.quantity}</span>
                      <button
                        onClick={() => handleUpdateQty(idx, 1)}
                        className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notes specific to the kitchen */}
                  <div className="text-xs">
                    <input
                      id={`notes-input-${idx}`}
                      type="text"
                      placeholder="Instrucciones al chef (ej. sin cebolla)"
                      value={cartItem.notes}
                      onChange={(e) => handleUpdateItemNotes(idx, e.target.value)}
                      className="w-full text-xs font-sans bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-400"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <CheckCircle className="h-8 w-8 mb-2 opacity-30 text-slate-700" />
              <p className="text-xs font-sans">El carrito está vacío.</p>
              <span className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Selecciona platillos o de la carta a la izquierda.</span>
            </div>
          )}
        </div>

        {/* Pricing & Submit actions footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/70 space-y-4">
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>I.V.A. (16% Incluido):</span>
              <span>${(total * 0.16).toFixed(2)}</span>
            </div>
            <div className="pt-2.5 border-t border-slate-200 flex justify-between text-sm">
              <strong className="font-sans font-bold text-slate-800">Total Comanda:</strong>
              <strong className="text-base font-bold text-slate-950">${total.toFixed(2)}</strong>
            </div>
          </div>

          <button
            onClick={handleSendOrder}
            disabled={!selectedTableId || cart.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
              selectedTableId && cart.length > 0
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer hover:-translate-y-0.5 shadow-indigo-700/10'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Send className="h-4 w-4" />
            Enviar Pedido a Cocina
          </button>
        </div>
      </div>
    </div>
  );
}
