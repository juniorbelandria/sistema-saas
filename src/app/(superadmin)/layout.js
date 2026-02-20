'use client';

import { Globe, Store, Users, Shield, CreditCard, ScrollText, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

const menuItems = [
  { icon: Globe, label: 'Dashboard Global', href: '/superadmin/dashboard' },
  { icon: Store, label: 'Negocios', href: '/superadmin/negocios' },
  { icon: Users, label: 'Usuarios', href: '/superadmin/usuarios' },
  { icon: Shield, label: 'Super Admins', href: '/superadmin/super-admins' },
  { icon: CreditCard, label: 'Gestión de Planes', href: '/superadmin/planes' },
  { icon: ScrollText, label: 'Auditoría Global', href: '/superadmin/auditoria' },
  { icon: BookOpen, label: 'Catálogos', href: '/superadmin/catalogos' },
];

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-content1 border-r border-divider p-4 hidden md:block">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Super Admin</h1>
          </div>
          <p className="text-xs text-foreground/60">Panel de Control Global</p>
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
            <h2 className="text-lg font-semibold text-foreground">Panel Global</h2>
            <p className="text-xs text-foreground/60">Gestión de toda la plataforma</p>
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
