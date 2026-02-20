'use client';

import { useState } from 'react';
import { Globe, Store, Users, Shield, CreditCard, ScrollText, BookOpen, Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:fixed inset-y-0 left-0 z-50
        w-48 bg-content1
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col overflow-hidden
      `}>
        {/* Header del Sidebar */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground">Super Admin</h1>
                <p className="text-xs text-foreground/60">Control Global</p>
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
                    ? 'bg-primary shadow-md shadow-primary/30'
                    : 'hover:bg-content2'
                }`}
              >
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-foreground'}`} />
                <span className={`text-[13px] font-medium ${isActive ? 'text-white' : 'text-foreground'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar */}
        <div className="p-3 space-y-2">
          <DevNavigation />
          <div className="px-3 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <p className="text-xs font-semibold text-foreground mb-1">Acceso Total</p>
            <p className="text-xs text-foreground/60">Control de plataforma</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-48">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-content1/95 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-content2 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Panel Global</h2>
              <p className="text-xs text-foreground/60 hidden sm:block">Gestión de toda la plataforma</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <button className="relative p-2 hover:bg-content2 rounded-xl transition-all">
                  <Bell className="w-5 h-5 text-foreground/70" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse"></span>
                  <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    5
                  </span>
                </button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Notificaciones" 
                variant="flat"
                className="w-80"
              >
                <DropdownItem key="header" className="h-10 gap-2" isReadOnly>
                  <p className="font-bold text-sm">Notificaciones</p>
                </DropdownItem>
                <DropdownItem key="notif1" className="h-auto py-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-danger rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Negocio vencido</p>
                      <p className="text-xs text-foreground/60">Panadería La Espiga - Plan vencido hace 5 días</p>
                      <p className="text-xs text-foreground/40 mt-1">Hace 10 minutos</p>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem key="notif2" className="h-auto py-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-warning rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Plan próximo a vencer</p>
                      <p className="text-xs text-foreground/60">Ferretería El Martillo vence en 3 días</p>
                      <p className="text-xs text-foreground/40 mt-1">Hace 1 hora</p>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem key="notif3" className="h-auto py-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Nuevo negocio registrado</p>
                      <p className="text-xs text-foreground/60">Supermercado Norte - Plan Anual</p>
                      <p className="text-xs text-foreground/40 mt-1">Hace 2 horas</p>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem key="notif4" className="h-auto py-3">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Nuevo usuario registrado</p>
                      <p className="text-xs text-foreground/60">23 nuevos usuarios esta semana</p>
                      <p className="text-xs text-foreground/40 mt-1">Hace 3 horas</p>
                    </div>
                  </div>
                </DropdownItem>
                <DropdownItem key="all" className="h-10" textValue="Ver todas">
                  <p className="text-center text-sm text-primary font-semibold">Ver todas las notificaciones</p>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform hover:scale-105"
                  size="sm"
                  name="SA"
                  showFallback
                  fallback={<Shield className="w-4 h-4" />}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="User menu" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Super Admin</p>
                  <p className="text-xs text-foreground/60">superadmin@sistema.com</p>
                </DropdownItem>
                <DropdownItem key="settings" startContent={<Settings className="w-4 h-4" />}>
                  Configuración
                </DropdownItem>
                <DropdownItem key="logout" color="danger" startContent={<LogOut className="w-4 h-4" />}>
                  Cerrar sesión
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
