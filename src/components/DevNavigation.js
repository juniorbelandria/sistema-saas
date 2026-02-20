'use client';

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownSection, DropdownItem, Button } from '@heroui/react';
import { Wrench } from 'lucide-react';

export default function DevNavigation() {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="flat" 
          size="sm"
          startContent={<Wrench className="w-4 h-4" />}
          className="bg-content2"
        >
          Dev Nav
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Navegación de desarrollo">
        <DropdownSection title="Auth" showDivider>
          <DropdownItem key="login" href="/login">
            Login
          </DropdownItem>
          <DropdownItem key="register" href="/register">
            Registro
          </DropdownItem>
          <DropdownItem key="verify" href="/verify-email">
            Verificar Email
          </DropdownItem>
          <DropdownItem key="forgot" href="/forgot-password">
            Olvidé Contraseña
          </DropdownItem>
          <DropdownItem key="reset" href="/reset-password">
            Reset Password
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title="Dashboards">
          <DropdownItem key="admin" href="/admin/dashboard">
            Admin Dashboard
          </DropdownItem>
          <DropdownItem key="superadmin" href="/superadmin/dashboard">
            Super Admin Dashboard
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
