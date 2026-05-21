export interface Ingredient {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  unit: string;
}

export type TableStatus = 'libre' | 'ocupada' | 'reservada' | 'esperando_cuenta';

export interface Table {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  currentOrderId?: string;
}

export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'pagado';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
  status: 'pendiente' | 'listo' | 'preparando';
}

export interface Order {
  id: string;
  tableId: string;
  tableNumber: number;
  waiterId: string;
  waiterName: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  notes?: string;
  timestamp: string; // ISO string
  paidTimestamp?: string;
  paymentMethod?: 'efectivo' | 'tarjeta' | 'transferencia';
  customerName?: string;
}

export type StaffRole = 'admin' | 'chef' | 'mesero' | 'cajero';

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
  status: 'activo' | 'inactivo';
  password?: string;
}

export interface Shift {
  id: string;
  staffId: string;
  staffName: string;
  staffRole: StaffRole;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  visits: number;
  totalSpent: number;
  notes?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: 'alimentos' | 'bebidas' | 'postres';
  ingredients: { ingredientId: string; quantity: number }[]; // Deducts from inventory
  color: string; // Custom tile color or accent
}
