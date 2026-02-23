'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card, CardBody, Chip } from '@heroui/react';
import { ArrowLeft, CheckCircle2, Shield, Clock, Mail } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

// 1. El componente que tiene la lógica
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const type = searchParams.get('type'); // 'signup' o 'recovery'
  
  const [codigo, setCodigo] = useState(['', '', '', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email || !type) {
      toast.error('Parámetros inválidos');
      router.push('/login');
    }
  }, [email, type, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    // Auto-focus al siguiente input
    if (value && index < 7) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: ir al anterior si está vacío
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 8);
    const newCodigo = pastedData.split('').concat(Array(8).fill('')).slice(0, 8);
    setCodigo(newCodigo);
    
    // Focus en el último input con valor
    const lastIndex = Math.min(pastedData.length, 7);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    const codigoCompleto = codigo.join('');
    
    if (codigoCompleto.length !== 8) {
      setError('Por favor ingresa los 8 dígitos');
      toast.error('Por favor ingresa los 8 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: codigoCompleto,
        type: type === 'signup' ? 'signup' : 'recovery'
      });

      if (error) throw error;

      // Éxito en la verificación
      if (type === 'signup') {
        toast.success('¡Cuenta verificada exitosamente!');
        router.push('/admin/dashboard');
      } else if (type === 'recovery') {
        toast.success('Código verificado, ahora cambia tu contraseña');
        router.push('/reset-password');
      }
    } catch (error) {
      console.error('Error al verificar código:', error);
      setError(error.message || 'Código inválido o expirado');
      toast.error(error.message || 'Código inválido o expirado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviar = async () => {
    if (countdown > 0) return;

    setCountdown(60);
    
    try {
      if (type === 'signup') {
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email
        });
        if (error) throw error;
      } else if (type === 'recovery') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      }
      
      toast.success('Código reenviado exitosamente');
    } catch (error) {
      console.error('Error al reenviar código:', error);
      toast.error(error.message || 'Error al reenviar el código');
      setCountdown(0);
    }
  };

  const colorType = type === 'signup' ? 'primary' : 'warning';

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Theme Toggle y Dev Navigation */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
        <DevNavigation />
        <ThemeToggle />
      </div>

      {/* Columna Izquierda - Branding */}
      <div className="hidden xl:flex xl:w-1/2 bg-content2 p-6 xl:p-8 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
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
              {type === 'signup' ? 'Verifica tu' : 'Recupera tu'}{' '}
              <span className={`text-${colorType}`}>
                {type === 'signup' ? 'correo electrónico' : 'contraseña'}
              </span>
            </h2>
            
            <p className="text-xs text-foreground/70 leading-relaxed">
              {type === 'signup' 
                ? 'Hemos enviado un código de 8 dígitos a tu correo. Ingrésalo para activar tu cuenta y comenzar a configurar tu negocio.'
                : 'Ingresa el código de 8 dígitos que enviamos a tu correo para verificar tu identidad y poder cambiar tu contraseña.'
              }
            </p>
          </div>

          {/* Pasos */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-${colorType} flex items-center justify-center`}>
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">1. Revisa tu correo</h3>
                <p className="text-xs text-foreground/60">Busca el email de verificación en tu bandeja</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">2. Ingresa el código</h3>
                <p className="text-xs text-foreground/60">Copia el código de 8 dígitos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <Shield className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">3. {type === 'signup' ? 'Activa tu cuenta' : 'Cambia tu contraseña'}</h3>
                <p className="text-xs text-foreground/60">
                  {type === 'signup' ? 'Completa el registro de tu negocio' : 'Crea una nueva contraseña segura'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-foreground/10">
            <p className="text-xs text-foreground font-bold leading-relaxed">
              <span className={`text-${colorType} text-sm`}>Aviso:</span> Usuario responsable de obligaciones fiscales. 
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
            <Chip color={colorType} variant="flat" size="sm">
              {type === 'signup' ? 'Verificación de Registro' : 'Recuperación de Contraseña'}
            </Chip>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Verifica tu código
            </h2>
            <p className="text-sm text-foreground/60">
              Ingresa el código de 8 dígitos enviado a
            </p>
            <p className="text-sm font-bold text-primary">
              {email}
            </p>
          </div>

          <form onSubmit={handleVerificar} className="space-y-5">
            {/* Inputs de código separados - 8 dígitos */}
            <div className="flex justify-center gap-1.5">
              {codigo.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-center text-xl font-bold tracking-widest",
                    inputWrapper: `w-10 h-12 sm:w-12 sm:h-14 border-2 data-[focus=true]:border-${colorType}`
                  }}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-danger text-center">{error}</p>
            )}

            <Button
              type="submit"
              size="lg"
              color={colorType}
              className="w-full font-semibold text-sm sm:text-base min-h-[52px]"
              isLoading={isLoading}
              startContent={!isLoading && <CheckCircle2 className="w-5 h-5" />}
            >
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </Button>
          </form>

          <Card className="border-none shadow-sm bg-content2">
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground mb-1">
                    ¿No recibiste el código?
                  </p>
                  {countdown > 0 ? (
                    <p className="text-xs text-foreground/60">
                      Podrás reenviar en {countdown} segundos
                    </p>
                  ) : (
                    <button
                      onClick={handleReenviar}
                      className="text-xs text-primary hover:text-primary/80 font-medium transition-colors underline"
                    >
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="text-center">
            <Link href="/login">
              <Button
                variant="light"
                size="sm"
                startContent={<ArrowLeft className="w-4 h-4" />}
                className="text-foreground/60 hover:text-foreground"
              >
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. La página principal exportada
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground/60">Cargando verificador...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
