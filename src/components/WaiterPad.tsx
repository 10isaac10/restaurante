import React, { useState, useEffect } from 'react';
import { Table, MenuItem, Ingredient, Staff, Order, OrderItem, OrderStatus } from '../types';
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
  Tags,
  ClipboardList,
  Check,
  CheckCheck,
  ChefHat,
  History,
  Edit
} from 'lucide-react';

interface WaiterPadProps {
  tables: Table[];
  menuItems: MenuItem[];
  ingredients: Ingredient[];
  staff: Staff[];
  orders: Order[];
  onSubmitOrder: (order: Omit<Order, 'id'>) => void;
  onUpdateOrderStatus?: (orderId: string, status: OrderStatus) => void;
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
  onUpdateOrderStatus,
  selectedTableIdFromProps,
  resetSelectedTableId,
  currentUser
}: WaiterPadProps) {
  // View states (New order vs existing list)
  const [subTab, setSubTab] = useState<'tomar' | 'seguimiento'>('tomar');
  const [orderFilter, setOrderFilter] = useState<'todos' | 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'pagado'>('todos');

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

  const handleEditOrder = (order: Order) => {
    setSelectedTableId(order.tableId);
    setCustomerName(order.customerName || '');
    setOrderNotes(order.notes || '');
    
    const loadedCart = order.items.map(item => {
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
    setSubTab('tomar');
  };

  // Find orders belonging to currently active waiter (or all if admin)
  const waiterOrders = orders.filter(o => {
    if (currentUser?.role === 'mesero') {
      return o.waiterId === currentUser.id;
    }
    return true; // Admin/Chef can see all orders in this tracking view
  });

  const filteredOrdersForCounter = waiterOrders.filter(o => o.status !== 'pagado');
  const countPending = waiterOrders.filter(o => o.status === 'pendiente').length;
  const countPrep = waiterOrders.filter(o => o.status === 'preparando').length;
  const countReady = waiterOrders.filter(o => o.status === 'listo').length;

  const displayedOrders = waiterOrders.filter(o => {
    if (orderFilter === 'todos') return true;
    if (orderFilter === 'pendiente') return o.status === 'pendiente';
    if (orderFilter === 'preparando') return o.status === 'preparando';
    if (orderFilter === 'listo') return o.status === 'listo';
    if (orderFilter === 'entregado') return o.status === 'entregado';
    if (orderFilter === 'pagado') return o.status === 'pagado';
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      {/* Elegante barra de subpestañas para el mesero */}
      <div className="bg-white border-b border-slate-200 px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl mr-1 hidden md:block border border-indigo-100">
            <ClipboardList className="h-4.5 w-4.5" />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSubTab('tomar')}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'tomar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Plus className="h-4 w-4" />
              Tomar Comanda
            </button>
            <button
              onClick={() => setSubTab('seguimiento')}
              className={`px-4.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                subTab === 'seguimiento'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <ClipboardList className="h-4 w-4" />
              Ver Pedidos
              {filteredOrdersForCounter.length > 0 && (
                <span className={`ml-0.5 px-2 py-0.5 text-[10px] rounded-full font-black leading-none ${
                  subTab === 'seguimiento' ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'
                }`}>
                  {filteredOrdersForCounter.length}
                </span>
              )}
            </button>
          </div>
        </div>
        <div className="text-right w-full sm:w-auto">
          <span className="text-[10.5px] text-slate-400 font-mono uppercase tracking-wider">
            Sesión: <strong className="text-slate-700 font-semibold">{currentUser?.name || 'Invitado'}</strong>
          </span>
        </div>
      </div>

      {subTab === 'tomar' ? (
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
                    className="w-full text-xs font-sans bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 font-medium"
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
                    className="w-full text-xs font-sans bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-indigo-500 font-medium"
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
                    className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all truncate cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm font-bold'
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
                  className="w-full pl-9 pr-4 py-2 text-xs font-semibold bg-slate-50 border border-slate-200/80 rounded-full text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-200"
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
                          : 'hover:scale-102 hover:shadow-md cursor-pointer border-indigo-100/60 shadow-xs'
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
                        <h4 className="text-sm font-bold mt-1.5 font-sans leading-tight text-slate-800">
                          {item.name}
                        </h4>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        <span className="text-base font-bold font-mono text-slate-900">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-sans bg-white/80 px-2.5 py-0.5 rounded-lg border border-slate-200/40 text-indigo-650 font-bold transition-all group-hover:bg-indigo-50">
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
                  <p className="text-xs text-slate-405 font-sans font-medium">No se encontraron productos coincidentes.</p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Right Drawer */}
          <div className="w-[420px] bg-slate-50/10 shadow-xl border-l border-slate-200 bg-white flex flex-col shrink-0">
            <div className="p-6 border-b border-slate-100">
              <span className="text-[10px] font-bold tracking-wider text-slate-450 uppercase font-mono block mb-1">Resumen de Comanda</span>
              <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center justify-between">
                <span>Comanda Actual</span>
                {selectedTableId && (
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Mesa {tables.find(t => t.id === selectedTableId)?.number}
                  </span>
                )}
              </h3>
            </div>

            {/* Selected table warning/indicator */}
            {!selectedTableId && (
              <div className="m-4 p-4 rounded-xl bg-amber-50 border border-amber-200/80 flex gap-3 text-xs text-amber-800">
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
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col gap-2.5">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <span className="text-xs font-bold text-slate-905 font-sans leading-snug block">
                            {cartItem.menuItem.name}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            ${cartItem.menuItem.price.toFixed(2)} c/u
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(idx)}
                          className="text-slate-405 hover:text-rose-650 p-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Qty selectors */}
                      <div className="flex justify-between items-center bg-white border border-slate-200 rounded-xl px-2.5 py-1.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Cantidad</span>
                        <div className="flex items-center gap-2.5">
                          <button
                            onClick={() => handleUpdateQty(idx, -1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-sm font-bold font-mono text-slate-900">{cartItem.quantity}</span>
                          <button
                            onClick={() => handleUpdateQty(idx, 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
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
                          className="w-full text-xs font-sans bg-white border border-slate-200/80 rounded-xl px-3 py-1.5 text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-450">
                  <CheckCircle className="h-8 w-8 mb-2.5 opacity-30 text-indigo-900" />
                  <p className="text-xs font-bold text-slate-700">El carrito está vacío</p>
                  <span className="text-[11px] text-slate-400 mt-1 max-w-[200px]">Selecciona productos de la carta para crear la comanda.</span>
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
                className={`w-full py-3.5 rounded-xl font-bold text-xs tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-2 ${
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
      ) : (
        /* Pantalla de Seguimiento de Pedidos ("Ver Pedidos") */
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          {/* Stats Bar at Top */}
          <div className="px-8 py-5 shrink-0 bg-white border-b border-slate-200/80 flex flex-wrap gap-4 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Seguimiento de Comandas</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Revisa las comandas enviadas, su estado en cocina y entrega los platillos a las mesas.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-slate-600 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                <span>Pendientes:</span>
                <span className="font-mono font-bold text-slate-900">{countPending}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-slate-600 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>En Cocina:</span>
                <span className="font-mono font-bold text-amber-700">{countPrep}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full bg-emerald-550 ${countReady > 0 ? 'animate-ping' : ''}`}></span>
                <span>Listos para Servir:</span>
                <span className="font-mono font-black text-emerald-700">{countReady}</span>
              </div>
            </div>
          </div>

          {/* Filters Row */}
          <div className="px-8 py-4 shrink-0 bg-white border-b border-slate-200/80 flex gap-2 overflow-x-auto">
            {([
              { id: 'todos', label: 'Todas las Comandas' },
              { id: 'pendiente', label: 'Pendientes ⏳' },
              { id: 'preparando', label: 'En Cocina 🔥' },
              { id: 'listo', label: 'Listos para Servir 🍽️' },
              { id: 'entregado', label: 'Entregados ✔' },
              { id: 'pagado', label: 'Historial Pagados 💵' }
            ] as const).map((filt) => (
              <button
                key={filt.id}
                onClick={() => setOrderFilter(filt.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-all truncate cursor-pointer ${
                  orderFilter === filt.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                }`}
              >
                {filt.label}
              </button>
            ))}
          </div>

          {/* Orders Board Grid */}
          <div className="flex-1 p-8 overflow-y-auto">
            {displayedOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedOrders.map((order) => {
                  const itemsCount = order.items.reduce((acc, i) => acc + i.quantity, 0);
                  const isReady = order.status === 'listo';
                  
                  return (
                    <div 
                      key={order.id}
                      className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 relative overflow-hidden ${
                        isReady 
                          ? 'border-emerald-450 ring-2 ring-emerald-100/50 shadow-md' 
                          : 'border-slate-200 hover:shadow-xs'
                      }`}
                    >
                      {/* Accent color bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                        order.status === 'pendiente' 
                          ? 'bg-slate-350' 
                          : order.status === 'preparando' 
                          ? 'bg-amber-400' 
                          : order.status === 'listo' 
                          ? 'bg-emerald-500 animate-pulse' 
                          : order.status === 'entregado' 
                          ? 'bg-indigo-500' 
                          : 'bg-slate-300'
                      }`} />

                      {/* Header */}
                      <div className="flex justify-between items-start pt-1.5">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Comanda</span>
                          <h4 className="text-2xl font-black text-slate-900 leading-tight">
                            Mesa {order.tableNumber}
                          </h4>
                        </div>
                        <span className={`px-2.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 ${
                          order.status === 'pendiente' 
                            ? 'bg-slate-50 text-slate-505 border border-slate-200' 
                            : order.status === 'preparando' 
                            ? 'bg-amber-50 text-amber-705 border border-amber-200' 
                            : order.status === 'listo' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 animate-pulse' 
                            : order.status === 'entregado' 
                            ? 'bg-indigo-50 text-indigo-705 border border-indigo-200' 
                            : 'bg-slate-50 text-slate-500'
                        }`}>
                          <Clock className="h-3.5 w-3.5" />
                          <span className="font-sans font-bold">
                            {order.status === 'pendiente' 
                              ? 'En espera' 
                              : order.status === 'preparando' 
                              ? 'Cocinando' 
                              : order.status === 'listo' 
                              ? '¡Listo!' 
                              : order.status === 'entregado' 
                              ? 'Entregado' 
                              : 'Pagado'}
                          </span>
                        </span>
                      </div>

                      {/* Customer / Timestamps */}
                      <div className="mt-3.5 space-y-1 text-xs text-slate-500 font-medium">
                        {order.customerName && (
                          <div className="flex justify-between">
                            <span>Comensal:</span>
                            <strong className="text-slate-800 font-bold">{order.customerName}</strong>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Fecha Comanda:</span>
                          <span className="font-mono text-[11px] text-slate-700 font-semibold">{new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Registrado por:</span>
                          <span className="text-slate-700 font-medium">{order.waiterName.split(' ')[0]}</span>
                        </div>
                      </div>

                      {/* Notes block if any */}
                      {order.notes && (
                        <div className="mt-3.5 p-2 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-800 italic">
                          "{order.notes}"
                        </div>
                      )}

                      {/* Items table */}
                      <div className="mt-4 border-t border-b border-slate-100 py-3.5 my-3.5 flex-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">Detalle de Consumos ({itemsCount})</span>
                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {order.items.map((item, id) => (
                            <div key={id} className="flex justify-between items-start text-xs">
                              <div className="flex items-start gap-1.5 text-slate-800">
                                <span className="font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md font-mono text-[10.5px]">
                                  {item.quantity}x
                                </span>
                                <div>
                                  <span className={item.status === 'listo' ? 'line-through text-slate-400' : 'font-medium text-slate-800'}>
                                    {item.name}
                                  </span>
                                  {item.notes && (
                                    <span className="block text-[10px] text-amber-700 italic">↳ {item.notes}</span>
                                  )}
                                </div>
                              </div>
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold font-mono rounded uppercase ${
                                item.status === 'listo' 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : item.status === 'preparando' 
                                  ? 'bg-amber-50 text-amber-700 animate-pulse' 
                                  : 'bg-slate-50 text-slate-500'
                              }`}>
                                {item.status === 'listo' ? 'listo' : item.status === 'preparando' ? 'preparando' : 'pendiente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total and Actions */}
                      <div className="mt-auto space-y-3.5">
                        <div className="flex justify-between items-end font-sans">
                          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">Importe Total:</span>
                          <strong className="text-xl font-mono text-slate-900 font-black">${order.total.toFixed(2)}</strong>
                        </div>

                        <div className="flex gap-2">
                          {/* Ready to serve / Delivery confirmation button */}
                          {order.status === 'listo' && onUpdateOrderStatus && (
                            <button
                              onClick={() => onUpdateOrderStatus(order.id, 'entregado')}
                              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all uppercase tracking-wide shadow-xs"
                            >
                              <CheckCheck className="h-4 w-4" />
                              Servido en Mesa
                            </button>
                          )}

                          {/* Allow Editing for orders that aren't paid yet */}
                          {order.status !== 'pagado' && (
                            <button
                              onClick={() => handleEditOrder(order)}
                              className={`py-2.5 px-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                                order.status === 'listo' ? '' : 'flex-1'
                              }`}
                              title="Editar pedido (Agregar o quitar elementos)"
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-400" />
                              <span>{order.status === 'listo' ? 'Editar' : 'Completar / Modificar'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white rounded-full border border-slate-200 text-slate-350 mb-4 animate-bounce shadow-xs">
                  <ClipboardList className="h-10 w-10 text-slate-400" />
                </div>
                <h4 className="text-base font-bold text-slate-800">Sin comandas en este estado</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
                  {orderFilter === 'todos' 
                    ? 'No se han registrado comandas activas aún. Comienza por tomar un pedido de mesa.'
                    : 'No se encontraron comandas con el estado seleccionado.'}
                </p>
                <button
                  onClick={() => setSubTab('tomar')}
                  className="mt-4 px-4.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-all border border-indigo-150 cursor-pointer"
                >
                  Tomar Nuevo Pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
