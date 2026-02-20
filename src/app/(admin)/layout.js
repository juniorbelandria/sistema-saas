'use client';

import { LayoutDashboard, ShoppingCart, Package, Users, CreditCard, Banknote, TrendingDown, Undo2, BarChart2, UserCheck, Settings, Warehouse, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: ShoppingCart, label: 'Nueva Venta', href: '/admin/ventas/nueva' },
  { icon: Receipt, label: 'Historial Ventas', href: '/admin/ventas' },
  { icon: Package, label: 'Productos', href: '/admin/productos' },
  { icon: Warehouse, label: 'Inventario', href: '/admin/inventario' },
  { icon: Users, label: 'Clientes', href: '/admin/clientes' },
  { icon: CreditCard, label: 'Fiados', href: '/admin/fiados' },
  { icon: Banknote, label: 'Caja', href: '/admin/caja' },
  { icon: TrendingDown, label: 'Gastos', href: '/admin/gastos' },
  { icon: Undo2, label: 'Devoluciones', href: '/admin/devoluciones' },
  { icon: BarChart2, label: 'Reportes', href: '/admin/reportes' },
  { icon: UserCheck, label: 'Equipo', href: '/admin/equipo' },
  { icon: Settings, label: 'Configuración', href: '/admin/configuracion' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background relative">

      {/* Sidebar */}
      <aside className="w-64 bg-content1 border-r border-divider p-4 hidden md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-foreground">Sistema POS</h1>
          <p className="text-xs text-foreground/60">Panel de Administración</p>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-foreground/70 hover:bg-content2 hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-divider bg-content1 flex items-center justify-between px-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Mi Negocio</h2>
            <p className="text-xs text-foreground/60">Plan: Prueba Gratis (7 días restantes)</p>
          </div>
          
          <div className="flex items-center gap-4">
            <DevNavigation />
            <ThemeToggle />
            <button className="text-sm text-foreground/70 hover:text-foreground">
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
