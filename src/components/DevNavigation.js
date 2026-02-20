'use client';

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, Button } from '@heroui/react';
import { Map } from 'lucide-react';

export default function DevNavigation() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="flat" 
          size="sm"
          startContent={<Map className="w-4 h-4" />}
          className="bg-content2 font-bold"
        >
          Rutas de Páginas
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Navegación de desarrollo"
        classNames={{
          base: "text-foreground"
        }}
      >
        <DropdownSection title="Auth" showDivider classNames={{ heading: "text-foreground font-bold" }}>
          <DropdownItem key="login" href="/login" classNames={{ title: "text-foreground/70 font-semibold" }}>
            Login
          </DropdownItem>
          <DropdownItem key="register" href="/register" classNames={{ title: "text-foreground/70 font-semibold" }}>
            Registro
          </DropdownItem>
          <DropdownItem key="verify" href="/verify-email" classNames={{ title: "text-foreground/70 font-semibold" }}>
            Verificar Email
          </DropdownItem>
          <DropdownItem key="forgot" href="/forgot-password" classNames={{ title: "text-foreground/70 font-semibold" }}>
            Olvidé Contraseña
          </DropdownItem>
          <DropdownItem key="reset" href="/reset-password" classNames={{ title: "text-foreground/70 font-semibold" }}>
            Reset Password
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title="Dashboards" classNames={{ heading: "text-foreground font-bold" }}>
          <DropdownItem key="admin" href="/admin/dashboard" classNames={{ title: "text-foreground/70 font-semibold" }}>
            Admin Dashboard
          </DropdownItem>
          <DropdownItem key="superadmin" href="/superadmin/dashboard" classNames={{ title: "text-foreground/70 font-semibold" }}>
            Super Admin Dashboard
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
