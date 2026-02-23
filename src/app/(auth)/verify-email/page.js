'use client';

import { Suspense, use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody, Chip } from '@heroui/react';
import { ArrowLeft, CheckCircle2, Shield, Clock, Mail } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// 1. Forzar renderizado dinámico (Esto le dice a Vercel que no pre-renderice)
export const dynamic = 'force-dynamic';

// 2. Componente de Lógica (Recibe la promesa de los parámetros)
function VerifyEmailForm({ searchParamsPromise }) {
  // Desempaquetamos la promesa según el estándar de Next.js 15/16
  const searchParams = use(searchParamsPromise);
  const email = searchParams?.email;
  const type = searchParams?.type; // 'signup' o 'recovery'
  
  const router = useRouter();
  const [codigo, setCodigo] = useState(['', '', '', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email || !type) {
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
    if (value.length > 1) value = value[0];
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);
    if (value && index < 7) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !codigo[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 8);
    const newCodigo = pastedData.split('').concat(Array(8).fill('')).slice(0, 8);
    setCodigo(newCodigo);
    const lastIndex = Math.min(pastedData.length, 7);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    const codigoCompleto = codigo.join('');
    if (codigoCompleto.length !== 8) {
      toast.error('Ingresa los 8 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: codigoCompleto,
        type: type === 'signup' ? 'signup' : 'recovery'
      });
      if (error) throw error;
      
      if (type === 'signup') {
        toast.success('¡Cuenta verificada!');
        router.push('/admin/dashboard');
      } else {
        toast.success('Código correcto');
        router.push('/reset-password');
      }
    } catch (err) {
      toast.error(err.message || 'Código inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const colorType = type === 'signup' ? 'primary' : 'warning';

  return (
    <div className="flex min-h-screen bg-background relative">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <DevNavigation />
        <ThemeToggle />
      </div>

      {/* Columna Branding (Oculta en mobile) */}
      <div className="hidden xl:flex xl:w-1/2 bg-content2 p-8 flex-col justify-center relative overflow-hidden">
        <div className="relative z-10 max-w-xl mx-auto w-full">
          <div className="flex items-center gap-3 mb-6">
            <Image src="/assets/imagenes/logonegro.webp" alt="Logo" width={48} height={48} priority />
            <h1 className="text-xl font-bold">Sistema POS</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {type === 'signup' ? 'Verifica tu cuenta' : 'Recupera tu acceso'}
          </h2>
          <p className="text-sm text-foreground/70 mb-8">
            Ingresa el código enviado a tu correo para continuar con Kliq POS.
          </p>
        </div>
      </div>

      {/* Columna Formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-4">
            <Chip color={colorType} variant="flat">{type === 'signup' ? 'Registro' : 'Seguridad'}</Chip>
            <h2 className="text-2xl font-bold">Ingresa el código</h2>
            <p className="text-sm font-bold text-primary">{email}</p>
          </div>

          <form onSubmit={handleVerificar} className="space-y-6">
            <div className="flex justify-center gap-2">
              {codigo.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  variant="bordered"
                  classNames={{ input: "text-center text-xl font-bold", inputWrapper: "w-10 h-12 border-2" }}
                />
              ))}
            </div>
            <Button type="submit" color={colorType} className="w-full h-12 font-bold" isLoading={isLoading}>
              Verificar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 3. Componente Principal Exportado (Con el Suspense Boundary)
export default function VerifyEmailPage({ searchParams }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-foreground/60">Cargando seguridad...</p>
        </div>
      </div>
    }>
      <VerifyEmailForm searchParamsPromise={searchParams} />
    </Suspense>
  );
}
