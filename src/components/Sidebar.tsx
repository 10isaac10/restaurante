import React from 'react';
import { 
  LayoutGrid, 
  Utensils, 
  ChefHat, 
  Receipt, 
  Boxes, 
  Sparkles,
  Users, 
  Clock, 
  Contact,
  TrendingUp,
  AlertTriangle,
  LogOut,
  UserCheck
} from 'lucide-react';
import { Staff } from '../types';

export type ActiveTab = 'mesas' | 'pedidos' | 'cocina' | 'cobros' | 'inventario' | 'personal' | 'clientes';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  inventoryAlertCount: number;
  pendingKitchenCount: number;
  currentUser: Staff | null;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  inventoryAlertCount,
  pendingKitchenCount,
  currentUser,
  onLogout
}: SidebarProps) {
  interface NavigationItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<any>;
    count: number;
    countColor?: string;
  }

  let menuItems: NavigationItem[] = [
    { id: 'mesas', label: 'Mesas / Salón', icon: LayoutGrid, count: 0 },
    { id: 'pedidos', label: 'Meseros / Pedidos', icon: Utensils, count: 0 },
    { id: 'cocina', label: 'Cocina / Chefs', icon: ChefHat, count: pendingKitchenCount, countColor: 'bg-amber-500 text-white animate-pulse' },
    { id: 'cobros', label: 'Caja y Ventas', icon: Receipt, count: 0 },
    { id: 'inventario', label: 'Inventario', icon: Boxes, count: inventoryAlertCount, countColor: 'bg-rose-500 text-white' },
    { id: 'personal', label: 'Personal y Horarios', icon: Users, count: 0 },
    { id: 'clientes', label: 'Clientes / CRM', icon: Contact, count: 0 },
  ];

  // If the user's role is "mesero", filter out tabs they shouldn't access
  if (currentUser && currentUser.role === 'mesero') {
    menuItems = menuItems.filter(item => 
      item.id === 'mesas' || item.id === 'pedidos' || item.id === 'cobros'
    );
  }

  return (
    <aside id="sidebar-nav" className="w-80 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
          <Sparkles className="h-6 w-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">RestoGest</h1>
          <span className="text-xs text-slate-400 font-mono">Control de Operaciones</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono mb-2">Módulos de Servicio</p>
        
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 shadow-sm shadow-indigo-950/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="font-sans font-medium">{item.label}</span>
              </div>
              
              {item.count > 0 && (
                <span className={`px-2 py-0.5 text-xs font-mono font-bold rounded-full ${item.countColor || 'bg-slate-850 text-slate-300'}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active User Card & Logout button */}
      {currentUser && (
        <div className="p-4 border-t border-slate-800 bg-slate-950/25 flex flex-col gap-3 font-sans">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-full border border-indigo-500/25 text-indigo-400">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate leading-tight">{currentUser.name}</p>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-0.5">
                {currentUser.role === 'admin' ? 'Administrador' : currentUser.role === 'mesero' ? 'Mesero' : currentUser.role === 'chef' ? 'Chef / Cocina' : 'Cajero'}
              </p>
            </div>
          </div>
          <button
            id="sidebar-logout-button"
            onClick={onLogout}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 hover:text-rose-400 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Quick Footer with Operational Status */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-500 font-mono">
        <div className="flex items-center justify-between text-slate-400 mb-1.5">
          <span>Servidor Local</span>
          <span className="flex items-center gap-1.5 text-indigo-400">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            Activo
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Turno: <span className="text-slate-300">Mediodía/Noche</span>
        </div>
        <div className="text-[10px] text-slate-500 mt-2">
          © 2026 RestoGest Software ERP
        </div>
      </div>
    </aside>
  );
}
