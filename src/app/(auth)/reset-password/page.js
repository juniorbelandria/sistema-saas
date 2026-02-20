'use client';

import { useState } from 'react';
import { Button, Input } from '@heroui/react';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);
    // TODO: Integrar con Supabase
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-sm text-foreground/60">
            Tu contraseña ha sido cambiada exitosamente
          </p>
          <Link href="/login">
            <Button color="primary" size="lg" className="w-full">
              Iniciar sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Theme Toggle y Dev Navigation */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
        <DevNavigation />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 xs:p-6 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative w-10 h-10">
              <Image
                src="/assets/imagenes/logonegro.webp"
                alt="Sistema POS"
                width={40}
                height={40}
                className="object-contain"
                priority
                quality={85}
              />
            </div>
            <h1 className="text-base font-bold text-foreground">Sistema POS</h1>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Nueva contraseña
            </h2>
            <p className="text-sm text-foreground/60">
              Ingresa tu nueva contraseña segura
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-5">
            <Input
              label="Nueva Contraseña"
              placeholder="Mínimo 8 caracteres"
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
              endContent={
                <button type="button" onClick={() => setIsVisible(!isVisible)} className="focus:outline-none p-2">
                  {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              type={isVisible ? 'text' : 'password'}
              variant="bordered"
              size="lg"
              isRequired
              classNames={{
                label: "text-foreground font-bold",
                input: "text-foreground",
                inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
              }}
            />

            <Input
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onValueChange={setConfirmPassword}
              startContent={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
              endContent={
                <button type="button" onClick={() => setIsVisible2(!isVisible2)} className="focus:outline-none p-2">
                  {isVisible2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              type={isVisible2 ? 'text' : 'password'}
              variant="bordered"
              size="lg"
              isRequired
              isInvalid={confirmPassword && password !== confirmPassword}
              errorMessage={confirmPassword && password !== confirmPassword ? "Las contraseñas no coinciden" : ""}
              classNames={{
                label: "text-foreground font-bold",
                input: "text-foreground",
                inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
              }}
            />

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="w-full font-semibold min-h-[52px]"
              isLoading={isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
