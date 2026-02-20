'use client';

import { LayoutDashboard, ShoppingCart, Package, Users, CreditCard, Banknote, TrendingDown, Undo2, BarChart2, UserCheck, Settings, Warehouse, Receipt } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ShoppingCart, label: 'Nueva Venta', href: '/ventas/nueva' },
  { icon: Receipt, label: 'Historial Ventas', href: '/ventas' },
  { icon: Package, label: 'Productos', href: '/productos' },
  { icon: Warehouse, label: 'Inventario', href: '/inventario' },
  { icon: Users, label: 'Clientes', href: '/clientes' },
  { icon: CreditCard, label: 'Fiados', href: '/fiados' },
  { icon: Banknote, label: 'Caja', href: '/caja' },
  { icon: TrendingDown, label: 'Gastos', href: '/gastos' },
  { icon: Undo2, label: 'Devoluciones', href: '/devoluciones' },
  { icon: BarChart2, label: 'Reportes', href: '/reportes' },
  { icon: UserCheck, label: 'Equipo', href: '/equipo' },
  { icon: Settings, label: 'Configuración', href: '/configuracion' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* DEV: Links de Navegación Rápida */}
      <div className="absolute top-20 right-4 z-50 bg-content1 border border-divider rounded-lg p-3 shadow-lg max-w-xs">
        <p className="text-xs font-bold text-foreground mb-2">🔧 Navegación Dev</p>
        <div className="space-y-1 text-xs">
          <p className="font-semibold text-foreground/70 mt-2">Auth:</p>
          <a href="/login" className="block text-primary hover:underline">→ Login</a>
          <a href="/register" className="block text-primary hover:underline">→ Registro</a>
          <a href="/verify-email" className="block text-primary hover:underline">→ Verificar Email</a>
          <a href="/forgot-password" className="block text-primary hover:underline">→ Olvidé Contraseña</a>
          <a href="/reset-password" className="block text-primary hover:underline">→ Reset Password</a>
          
          <p className="font-semibold text-foreground/70 mt-2">Dashboards:</p>
          <a href="/dashboard" className="block text-success hover:underline">→ Admin Dashboard</a>
          <a href="/superadmin/dashboard" className="block text-warning hover:underline">→ Super Admin Dashboard</a>
        </div>
      </div>

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
