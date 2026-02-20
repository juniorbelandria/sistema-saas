'use client';

import { useState } from 'react';
import { LayoutDashboard, ShoppingCart, Package, Users, CreditCard, Banknote, TrendingDown, Undo2, BarChart2, UserCheck, Settings, Warehouse, Receipt, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import Image from 'next/image';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-48 bg-content1 border-r border-divider
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-divider">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/assets/imagenes/logonegro.webp"
                  alt="Sistema POS"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">Sistema POS</h1>
                <p className="text-xs text-foreground/60">Admin</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-content2 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'text-foreground/70 hover:bg-content2 hover:text-foreground'
                }`}
              >
                <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                <span className="text-[13px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 border-t border-divider">
          <div className="px-3 py-2 bg-content2 rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-1">Mi Negocio</p>
            <p className="text-xs text-foreground/60">Plan: Prueba Gratis</p>
            <p className="text-xs text-warning">7 días restantes</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-divider bg-content1/95 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-content2 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Mi Negocio</h2>
              <p className="text-xs text-foreground/60 hidden sm:block">Panel de Administración</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <DevNavigation />
            <ThemeToggle />
            <button className="text-xs lg:text-sm text-foreground/70 hover:text-foreground hidden sm:block">
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-5 lg:p-6 overflow-auto bg-gradient-to-br from-background to-content1">
          {children}
        </main>
      </div>
    </div>
  );
}
