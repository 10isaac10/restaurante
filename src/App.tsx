import React, { useState, useEffect } from 'react';
import { 
  Table, 
  MenuItem, 
  Ingredient, 
  Staff, 
  Shift, 
  Customer, 
  Order, 
  TableStatus, 
  OrderStatus,
  OrderItem
} from './types';
import { 
  INITIAL_INGREDIENTS, 
  INITIAL_MENU_ITEMS, 
  INITIAL_TABLES, 
  INITIAL_STAFF, 
  INITIAL_CUSTOMERS, 
  INITIAL_SHIFTS, 
  INITIAL_ORDERS 
} from './data';
import Sidebar, { ActiveTab } from './components/Sidebar';
import TableMap from './components/TableMap';
import WaiterPad from './components/WaiterPad';
import KitchenSystem from './components/KitchenSystem';
import CashierSystem from './components/CashierSystem';
import InventoryManager from './components/InventoryManager';
import StaffManager from './components/StaffManager';
import CustomerManager from './components/CustomerManager';
import Login from './components/Login';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('mesas');

  // Currently logged-in employee session
  const [currentUser, setCurrentUser] = useState<Staff | null>(() => {
    const local = localStorage.getItem('rg_current_user');
    return local ? JSON.parse(local) : null;
  });

  // Sync session state to storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rg_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rg_current_user');
    }
  }, [currentUser]);

  // If waiter is logged in, restrict tab views
  useEffect(() => {
    if (currentUser && currentUser.role === 'mesero') {
      const allowedTabs: ActiveTab[] = ['mesas', 'pedidos', 'cobros'];
      if (!allowedTabs.includes(activeTab)) {
        setActiveTab('mesas');
      }
    }
  }, [currentUser, activeTab]);

  // Central Databases (with localStorage backup support)
  const [tables, setTables] = useState<Table[]>(() => {
    const local = localStorage.getItem('rg_tables');
    return local ? JSON.parse(local) : INITIAL_TABLES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    return INITIAL_MENU_ITEMS;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const local = localStorage.getItem('rg_ingredients');
    return local ? JSON.parse(local) : INITIAL_INGREDIENTS;
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const local = localStorage.getItem('rg_staff');
    return local ? JSON.parse(local) : INITIAL_STAFF;
  });

  const [shifts, setShifts] = useState<Shift[]>(() => {
    const local = localStorage.getItem('rg_shifts');
    return local ? JSON.parse(local) : INITIAL_SHIFTS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const local = localStorage.getItem('rg_customers');
    return local ? JSON.parse(local) : INITIAL_CUSTOMERS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const local = localStorage.getItem('rg_orders');
    return local ? JSON.parse(local) : INITIAL_ORDERS;
  });

  // Flow linkages across tabs
  const [linkingTableId, setLinkingTableId] = useState<string | null>(null);
  const [linkingOrderId, setLinkingOrderId] = useState<string | null>(null);

  // Sync state mutations back to Local Storage
  useEffect(() => {
    localStorage.setItem('rg_tables', JSON.stringify(tables));
  }, [tables]);

  useEffect(() => {
    localStorage.setItem('rg_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('rg_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('rg_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('rg_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('rg_orders', JSON.stringify(orders));
  }, [orders]);

  // Operational Logic Handlers

  // 1. Tables Status modifier
  const handleUpdateTableStatus = (tableId: string, status: TableStatus, reservationName?: string) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        // If transitioning back to "libre", make sure we clear the linked order reference
        const clearedAttrs = status === 'libre' ? { currentOrderId: undefined } : {};
        // Preserve or update reservationName if status is 'reservada'
        const resAttrs = status === 'reservada' 
          ? { reservationName: reservationName !== undefined ? reservationName : (t.reservationName || '') } 
          : { reservationName: undefined };
        return { ...t, status, ...clearedAttrs, ...resAttrs };
      }
      return t;
    }));
  };

  // 2. Waiter launches table order flow
  const handleSelectTableForOrder = (tableId: string) => {
    setLinkingTableId(tableId);
    setActiveTab('pedidos');
  };

  // 3. Jump to checkout bills with specific active ticket
  const handleGoToCheckout = (orderId: string) => {
    setLinkingOrderId(orderId);
    setActiveTab('cobros');
  };

  // 4. Create or edit waitstaff order ticket
  const handleSubmitOrder = (orderData: Omit<Order, 'id'>) => {
    const existingTable = tables.find(t => t.id === orderData.tableId);
    const existingOrderId = existingTable?.currentOrderId;

    let targetOrderId = existingOrderId || `order-${Date.now()}`;

    // Deduct raw stock ingredients based on menu requirements
    setIngredients(prevIngredients => {
      const cloned = [...prevIngredients];
      orderData.items.forEach(cartItem => {
        // Deduct based on this MenuItem's design
        const matchMenuItem = menuItems.find(mi => mi.id === cartItem.id);
        if (matchMenuItem) {
          matchMenuItem.ingredients.forEach(reqIng => {
            const dbIndex = cloned.findIndex(i => i.id === reqIng.ingredientId);
            if (dbIndex !== -1) {
              cloned[dbIndex].stock = Math.max(0, cloned[dbIndex].stock - (reqIng.quantity * cartItem.quantity));
            }
          });
        }
      });
      return cloned;
    });

    if (existingOrderId) {
      // Modify existing active comanda
      setOrders(prev => prev.map(ord => {
        if (ord.id === existingOrderId) {
          return {
            ...ord,
            items: orderData.items,
            total: orderData.total,
            notes: orderData.notes,
            customerName: orderData.customerName,
            waiterId: orderData.waiterId,
            waiterName: orderData.waiterName
          };
        }
        return ord;
      }));
    } else {
      // Insert new fresh comanda
      const newOrder: Order = {
        ...orderData,
        id: targetOrderId
      };
      setOrders(prev => [newOrder, ...prev]);
    }

    // Link table status to occupy
    setTables(prev => prev.map(t => {
      if (t.id === orderData.tableId) {
        return {
          ...t,
          status: 'ocupada' as const,
          currentOrderId: targetOrderId
        };
      }
      return t;
    }));

    setActiveTab('mesas');
  };

  // 5. Chef updates cook stage statuses of comanda
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        // If status changes to delivered, update constituent dish states toListo as well
        const adjustedItems = status === 'listo' 
          ? o.items.map(it => ({ ...it, status: 'listo' as const }))
          : o.items;
        
        return { ...o, status, items: adjustedItems };
      }
      return o;
    }));

    // Cascade status changes back to Floor layout if needed
    const targetOrder = orders.find(o => o.id === orderId);
    if (targetOrder) {
      if (status === 'listo') {
        // Ready for running! Flag with account details or notification
      } else if (status === 'entregado') {
        // At table - occupying
        setTables(prev => prev.map(t => {
          if (t.id === targetOrder.tableId) {
            return { ...t, status: 'ocupada' as const };
          }
          return t;
        }));
      }
    }
  };

  // 6. Cook toggles singular dishes states inside a ticket
  const handleUpdateOrderItemStatus = (
    orderId: string, 
    itemId: string, 
    itemStatus: 'pendiente' | 'preparando' | 'listo'
  ) => {
    setOrders(prev => prev.map(ord => {
      if (ord.id === orderId) {
        const updatedItems = ord.items.map(item => {
          if (item.id === itemId) {
            return { ...item, status: itemStatus };
          }
          return item;
        });

        // Smart check: if all items areListo inside the comanda, auto-escalate the order status toListo
        const allReady = updatedItems.every(i => i.status === 'listo');
        const nextOrderStatus: OrderStatus = allReady ? 'listo' : 'preparando';

        return {
          ...ord,
          items: updatedItems,
          status: ord.status === 'pendiente' ? 'preparando' : nextOrderStatus
        };
      }
      return ord;
    }));
  };

  // 7. Cashier registers receipt payment
  const handleProcessPayment = (
    orderId: string, 
    paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia',
    tipAmount: number,
    discountPercentage: number
  ) => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const discountVal = targetOrder.total * (discountPercentage / 100);
    const finalInvoiceTotal = Math.max(0, targetOrder.total + tipAmount - discountVal);

    // 1. Mark order paid with configurations
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'pagado' as const,
          paymentMethod,
          paidTimestamp: new Date().toISOString(),
          total: finalInvoiceTotal
        };
      }
      return o;
    }));

    // 2. Free up and clear table floor status
    setTables(prev => prev.map(t => {
      if (t.id === targetOrder.tableId) {
        return {
          ...t,
          status: 'libre' as const,
          currentOrderId: undefined
        };
      }
      return t;
    }));

    // 3. Credit loyalty visits onto Customer files
    if (targetOrder.customerName) {
      setCustomers(prev => prev.map(cust => {
        // Case-insensitive matches
        if (cust.name.toLowerCase().trim() === targetOrder.customerName?.toLowerCase().trim()) {
          return {
            ...cust,
            visits: cust.visits + 1,
            totalSpent: cust.totalSpent + finalInvoiceTotal
          };
        }
        return cust;
      }));
    }
  };

  // 8. Add raw stock ingredients
  const handleAddIngredient = (newIng: Omit<Ingredient, 'id'>) => {
    const nIng: Ingredient = {
      ...newIng,
      id: `i-${Date.now()}`
    };
    setIngredients(prev => [...prev, nIng]);
  };

  // 9. Update stock values
  const handleUpdateStock = (ingredientId: string, newStock: number) => {
    setIngredients(prev => prev.map(i => {
      if (i.id === ingredientId) {
        return { ...i, stock: Math.max(0, newStock) };
      }
      return i;
    }));
  };

  // 10. HR Staff catalogations
  const handleAddStaff = (newSt: Omit<Staff, 'id'>) => {
    const nStaff: Staff = {
      ...newSt,
      id: `s-${Date.now()}`
    };
    setStaff(prev => [...prev, nStaff]);
  };

  const handleRemoveStaff = (staffId: string) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    // Clear scheduled shifts for them as well
    setShifts(prev => prev.filter(sh => sh.staffId !== staffId));
  };

  // 11. Shift timers rosters
  const handleAddShift = (newSh: Omit<Shift, 'id'>) => {
    const nShift: Shift = {
      ...newSh,
      id: `sh-${Date.now()}`
    };
    setShifts(prev => [...prev, nShift]);
  };

  const handleRemoveShift = (shiftId: string) => {
    setShifts(prev => prev.filter(s => s.id !== shiftId));
  };

  // 12. CRM additions
  const handleAddCustomer = (newCust: Omit<Customer, 'id' | 'visits' | 'totalSpent'>) => {
    const nCust: Customer = {
      ...newCust,
      id: `c-${Date.now()}`,
      visits: 0,
      totalSpent: 0
    };
    setCustomers(prev => [nCust, ...prev]);
  };

  // Calculations for Notification indicators in Sidebar
  const inventoryAlertCount = ingredients.filter(i => i.stock <= i.minStock).length;
  const pendingKitchenCount = orders.filter(o => o.status === 'pendiente' || o.status === 'preparando').length;

  // Render Login screen if not signed in
  if (!currentUser) {
    return (
      <Login 
        staffList={staff} 
        onLoginSuccess={(user) => setCurrentUser(user)} 
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        inventoryAlertCount={inventoryAlertCount}
        pendingKitchenCount={pendingKitchenCount}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setActiveTab('mesas');
        }}
      />

      {/* Main viewport area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden text-slate-800">
        {activeTab === 'mesas' && (
          <TableMap 
            tables={tables}
            orders={orders}
            onUpdateTableStatus={handleUpdateTableStatus}
            onSelectTableForOrder={handleSelectTableForOrder}
            onGoToCheckout={handleGoToCheckout}
          />
        )}

        {activeTab === 'pedidos' && (
          <WaiterPad 
            tables={tables}
            menuItems={menuItems}
            ingredients={ingredients}
            staff={staff}
            orders={orders}
            onSubmitOrder={handleSubmitOrder}
            selectedTableIdFromProps={linkingTableId}
            resetSelectedTableId={() => setLinkingTableId(null)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'cocina' && (
          <KitchenSystem 
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateOrderItemStatus={handleUpdateOrderItemStatus}
          />
        )}

        {activeTab === 'cobros' && (
          <CashierSystem 
            orders={orders}
            tables={tables}
            onProcessPayment={handleProcessPayment}
            selectedOrderIdFromProps={linkingOrderId}
            resetSelectedOrderId={() => setLinkingOrderId(null)}
          />
        )}

        {activeTab === 'inventario' && (
          <InventoryManager 
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onUpdateStock={handleUpdateStock}
          />
        )}

        {activeTab === 'personal' && (
          <StaffManager 
            staffList={staff}
            shiftsList={shifts}
            onAddStaff={handleAddStaff}
            onAddShift={handleAddShift}
            onRemoveStaff={handleRemoveStaff}
            onRemoveShift={handleRemoveShift}
          />
        )}

        {activeTab === 'clientes' && (
          <CustomerManager 
            customers={customers}
            onAddCustomer={handleAddCustomer}
          />
        )}
      </main>
    </div>
  );
}
