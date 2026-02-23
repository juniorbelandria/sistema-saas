'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@heroui/react';
import { Lock, Eye, EyeOff, CheckCircle2, Shield, Key, Mail } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    // Verificar que el usuario tenga una sesión activa (después de verificar OTP)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sesión inválida. Por favor solicita un nuevo código de recuperación.');
        router.push('/forgot-password');
      } else {
        setHasSession(true);
      }
    };
    
    checkSession();
  }, [router]);

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success('Contraseña actualizada, ya puedes iniciar sesión');
      
      // Cerrar sesión y redirigir al login después de 2 segundos
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      toast.error(error.message || 'Error al actualizar la contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasSession) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-warning" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Verificando sesión...
          </h2>
        </div>
      </div>
    );
  }

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
            Tu contraseña ha sido cambiada exitosamente. Redirigiendo al inicio de sesión...
          </p>
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

      {/* Columna Izquierda - Branding */}
      <div className="hidden xl:flex xl:w-1/2 bg-content2 p-6 xl:p-8 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-danger/5"></div>
        
        <div className="relative z-10 max-w-xl mx-auto w-full">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/assets/imagenes/logonegro.webp"
                  alt="Sistema POS"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                  quality={85}
                />
              </div>
              <h1 className="text-base font-bold text-foreground">Sistema POS</h1>
            </div>
            
            <h2 className="text-2xl xl:text-3xl font-bold text-foreground mb-2">
              Crea una{' '}
              <span className="text-warning">nueva contraseña</span>
            </h2>
            
            <p className="text-xs text-foreground/70 leading-relaxed">
              Elige una contraseña segura para proteger tu cuenta. Asegúrate de que tenga 
              al menos 8 caracteres y sea fácil de recordar para ti.
            </p>
          </div>

          {/* Consejos de seguridad */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-warning flex items-center justify-center">
                <Key className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Mínimo 8 caracteres</h3>
                <p className="text-xs text-foreground/60">Usa una combinación de letras y números</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <Shield className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Contraseña única</h3>
                <p className="text-xs text-foreground/60">No uses la misma contraseña de otras cuentas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <Mail className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Fácil de recordar</h3>
                <p className="text-xs text-foreground/60">Pero difícil de adivinar para otros</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-foreground/10">
            <p className="text-xs text-foreground font-bold leading-relaxed">
              <span className="text-warning text-sm">Aviso:</span> Usuario responsable de obligaciones fiscales. 
              Sistema no certifica ante autoridades tributarias.
            </p>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="flex-1 flex items-center justify-center p-4 xs:p-6 sm:p-8 bg-background">
        <div className="w-full max-w-[90%] xs:max-w-md space-y-6">
          {/* Header Mobile */}
          <div className="xl:hidden flex items-center justify-center gap-3 mb-6">
            <div className="relative w-10 h-10 flex-shrink-0">
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
                inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-warning min-h-[52px]"
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
                inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-warning min-h-[52px]"
              }}
            />

            <Button
              type="submit"
              size="lg"
              color="warning"
              className="w-full font-semibold min-h-[52px]"
              isLoading={isLoading}
              startContent={!isLoading && <CheckCircle2 className="w-5 h-5" />}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
