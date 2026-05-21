import { Ingredient, MenuItem, Table, Staff, Shift, Customer, Order } from './types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'i1', name: 'Tortillas de maíz', stock: 120, minStock: 30, unit: 'pz' },
  { id: 'i2', name: 'Carne Al Pastor', stock: 15.5, minStock: 5.0, unit: 'kg' },
  { id: 'i3', name: 'Pollo deshebrado', stock: 8.0, minStock: 3.0, unit: 'kg' },
  { id: 'i4', name: 'Queso Oaxaca', stock: 12.0, minStock: 4.0, unit: 'kg' },
  { id: 'i5', name: 'Tequila Blanco', stock: 6, minStock: 2, unit: 'botella' },
  { id: 'i6', name: 'Jarabe de Horchata', stock: 10, minStock: 3, unit: 'L' },
  { id: 'i7', name: 'Arroz blanco', stock: 25.0, minStock: 10.0, unit: 'kg' },
  { id: 'i8', name: 'Salsa Verde de la casa', stock: 8, minStock: 3, unit: 'L' },
  { id: 'i9', name: 'Flan base (huevos/leche)', stock: 30, minStock: 10, unit: 'pz' },
  { id: 'i10', name: 'Fresas frescas', stock: 4.5, minStock: 1.5, unit: 'kg' },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm1',
    name: 'Orden de Tacos al Pastor (5 pz)',
    price: 95.0,
    category: 'alimentos',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    ingredients: [
      { ingredientId: 'i1', quantity: 5 },
      { ingredientId: 'i2', quantity: 0.150 },
    ],
  },
  {
    id: 'm2',
    name: 'Enchiladas Verdes (3 pz)',
    price: 110.0,
    category: 'alimentos',
    color: 'bg-emerald-100 border-emerald-300 text-emerald-800',
    ingredients: [
      { ingredientId: 'i1', quantity: 3 },
      { ingredientId: 'i3', quantity: 0.100 },
      { ingredientId: 'i8', quantity: 0.200 },
      { ingredientId: 'i4', quantity: 0.050 },
    ],
  },
  {
    id: 'm3',
    name: 'Quesadillas con Queso Oaxaca (3 pz)',
    price: 85.0,
    category: 'alimentos',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    ingredients: [
      { ingredientId: 'i1', quantity: 3 },
      { ingredientId: 'i4', quantity: 0.150 },
    ],
  },
  {
    id: 'm4',
    name: 'Margarita de Tequila',
    price: 75.0,
    category: 'bebidas',
    color: 'bg-lime-100 border-lime-300 text-lime-800',
    ingredients: [
      { ingredientId: 'i5', quantity: 0.06 }, // 60ml
    ],
  },
  {
    id: 'm5',
    name: 'Agua de Horchata Grande (1L)',
    price: 45.0,
    category: 'bebidas',
    color: 'bg-stone-100 border-stone-300 text-stone-800',
    ingredients: [
      { ingredientId: 'i6', quantity: 0.15 }, // 150ml of syrup
    ],
  },
  {
    id: 'm6',
    name: 'Flan Casero',
    price: 55.0,
    category: 'postres',
    color: 'bg-yellow-101 border-yellow-300 text-yellow-800',
    ingredients: [
      { ingredientId: 'i9', quantity: 1 },
    ],
  },
  {
    id: 'm7',
    name: 'Copa de Fresas con Crema',
    price: 60.0,
    category: 'postres',
    color: 'bg-rose-100 border-rose-300 text-rose-800',
    ingredients: [
      { ingredientId: 'i10', quantity: 0.150 },
    ],
  },
];

export const INITIAL_TABLES: Table[] = [
  { id: 't1', number: 1, capacity: 2, status: 'libre' },
  { id: 't2', number: 2, capacity: 2, status: 'libre' },
  { id: 't3', number: 3, capacity: 4, status: 'ocupada', currentOrderId: 'order-3' },
  { id: 't4', number: 4, capacity: 4, status: 'libre' },
  { id: 't5', number: 5, capacity: 6, status: 'ocupada', currentOrderId: 'order-2' },
  { id: 't6', number: 6, capacity: 8, status: 'libre' },
  { id: 't7', number: 7, capacity: 2, status: 'reservada' },
  { id: 't8', number: 8, capacity: 4, status: 'esperando_cuenta', currentOrderId: 'order-4' },
];

export const INITIAL_STAFF: Staff[] = [
  { id: 's1', name: 'Chef Sofía Ruiz', role: 'chef', phone: '551-234-5678', email: 'sofia.ruiz@restogest.com', status: 'activo', password: '1111' },
  { id: 's2', name: 'Chef Antonio Gómez', role: 'chef', phone: '551-876-5432', email: 'antonio.g@restogest.com', status: 'activo', password: '2222' },
  { id: 's3', name: 'Carlos Díaz (Mesero)', role: 'mesero', phone: '552-334-4556', email: 'carlos.diaz@restogest.com', status: 'activo', password: '3333' },
  { id: 's4', name: 'Lucía Fernández (Mesera)', role: 'mesero', phone: '552-667-7889', email: 'lucia.f@restogest.com', status: 'activo', password: '4444' },
  { id: 's5', name: 'Miguel cajero', role: 'cajero', phone: '553-998-8776', email: 'miguel.c@restogest.com', status: 'activo', password: '5555' },
  { id: 's6', name: 'Andrea Administrador', role: 'admin', phone: '554-111-2222', email: 'andrea.admin@restogest.com', status: 'activo', password: '9999' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Juan Pérez', phone: '551-555-0199', email: 'juan.perez@gmail.com', visits: 12, totalSpent: 1840.50, notes: 'Prefiere mesa en rincón, alérgico al cilantro' },
  { id: 'c2', name: 'María Rodríguez', phone: '551-555-0288', email: 'maria.rod@hotmail.com', visits: 5, totalSpent: 850.00, notes: 'Fan absoluta de las Enchiladas Verdes' },
  { id: 'c3', name: 'Luis Martínez', phone: '551-555-0377', email: 'luis.m@outlook.com', visits: 1, totalSpent: 215.00, notes: 'Cliente nuevo' },
];

export const INITIAL_SHIFTS: Shift[] = [
  { id: 'sh1', staffId: 's1', staffName: 'Chef Sofía Ruiz', staffRole: 'chef', date: '2026-05-21', startTime: '08:00', endTime: '16:00' },
  { id: 'sh2', staffId: 's2', staffName: 'Chef Antonio Gómez', staffRole: 'chef', date: '2026-05-21', startTime: '16:00', endTime: '23:30' },
  { id: 'sh3', staffId: 's3', staffName: 'Carlos Díaz (Mesero)', staffRole: 'mesero', date: '2026-05-21', startTime: '12:00', endTime: '20:00' },
  { id: 'sh4', staffId: 's4', staffName: 'Lucía Fernández (Mesera)', staffRole: 'mesero', date: '2026-05-21', startTime: '15:00', endTime: '23:00' },
  { id: 'sh5', staffId: 's5', staffName: 'Miguel cajero', staffRole: 'cajero', date: '2026-05-21', startTime: '11:00', endTime: '19:00' },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'order-1',
    tableId: 't1',
    tableNumber: 1,
    waiterId: 's3',
    waiterName: 'Carlos Díaz (Mesero)',
    items: [
      { id: 'm1', name: 'Orden de Tacos al Pastor (5 pz)', quantity: 2, price: 95.0, status: 'listo' },
      { id: 'm5', name: 'Agua de Horchata Grande (1L)', quantity: 2, price: 45.0, status: 'listo' },
    ],
    status: 'pagado',
    total: 280.0,
    timestamp: '2026-05-21T02:11:00Z',
    paidTimestamp: '2026-05-21T02:45:00Z',
    paymentMethod: 'efectivo',
    customerName: 'Juan Pérez',
  },
  {
    id: 'order-2',
    tableId: 't5',
    tableNumber: 5,
    waiterId: 's3',
    waiterName: 'Carlos Díaz (Mesero)',
    items: [
      { id: 'm2', name: 'Enchiladas Verdes (3 pz)', quantity: 3, price: 110.0, status: 'preparando' },
      { id: 'm4', name: 'Margarita de Tequila', quantity: 3, price: 75.0, status: 'listo' },
    ],
    status: 'preparando',
    total: 555.0,
    timestamp: '2026-05-21T03:02:00Z',
  },
  {
    id: 'order-3',
    tableId: 't3',
    tableNumber: 3,
    waiterId: 's4',
    waiterName: 'Lucía Fernández (Mesera)',
    items: [
      { id: 'm3', name: 'Quesadillas con Queso Oaxaca (3 pz)', quantity: 1, price: 85.0, status: 'pendiente' },
      { id: 'm5', name: 'Agua de Horchata Grande (1L)', quantity: 1, price: 45.0, status: 'listo' },
    ],
    status: 'pendiente',
    total: 130.0,
    timestamp: '2026-05-21T03:15:00Z',
  },
  {
    id: 'order-4',
    tableId: 't8',
    tableNumber: 8,
    waiterId: 's4',
    waiterName: 'Lucía Fernández (Mesera)',
    items: [
      { id: 'm1', name: 'Orden de Tacos al Pastor (5 pz)', quantity: 2, price: 95.0, status: 'listo' },
      { id: 'm6', name: 'Flan Casero', quantity: 2, price: 55.0, status: 'listo' },
      { id: 'm4', name: 'Margarita de Tequila', quantity: 1, price: 75.0, status: 'listo' },
    ],
    status: 'entregado',
    total: 375.0,
    timestamp: '2026-05-21T01:30:00Z',
  },
];
