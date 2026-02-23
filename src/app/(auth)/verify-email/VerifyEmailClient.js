'use client';

import { use, useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody } from '@heroui/react';
import { ArrowLeft, CheckCircle2, Shield, Clock, Mail, KeyRound, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function VerifyEmailClient({ searchParamsPromise }) {
  const searchParams = use(searchParamsPromise);
  const email = searchParams?.email;
  const type = searchParams?.type; // 'signup' o 'recovery'
  
  const router = useRouter();
  const [codigo, setCodigo] = useState(['', '', '', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
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
      toast.error('Por favor ingresa los 8 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: codigoCompleto,
        type: type === 'signup' ? 'signup' : 'recovery'
      });
      if (error) throw error;
      
      if (type === 'signup') {
        // Después de verificar el email, crear el negocio
        const user = data.user;
        const datosNegocio = user.user_metadata?.datos_negocio;
        
        if (datosNegocio) {
          // Llamar a la función RPC para crear el negocio
          const { data: rpcData, error: rpcError } = await supabase.rpc('registrar_usuario_con_negocio', {
            p_user_id: user.id,
            p_nombre_completo: datosNegocio.nombreCompleto,
            p_nombre_negocio: datosNegocio.nombreNegocio,
            p_nombre_completo_negocio: datosNegocio.razonSocial,
            p_direccion: datosNegocio.direccion,
            p_telefono: datosNegocio.telefono,
            p_email_negocio: email,
            p_pais_codigo: datosNegocio.codigoPais,
            p_moneda_base: datosNegocio.codigoMoneda,
            p_id_fiscal: datosNegocio.idFiscal || null,
            p_nombre_fiscal: datosNegocio.razonSocial,
            p_tipo_negocio: datosNegocio.tipoNegocio,
            p_regimen_fiscal: datosNegocio.regimenFiscal || null,
            p_usa_factura_electronica: datosNegocio.usaFacturaElectronica,
            p_prefijo_factura: 'FAC-'
          });

          if (rpcError) {
            console.error('Error al crear negocio:', rpcError);
            toast.error('Email verificado, pero hubo un error al crear el negocio. Contacta soporte.');
          } else if (rpcData && !rpcData.success) {
            toast.error(rpcData.error || 'Error al crear el negocio');
          } else {
            toast.success('Cuenta verificada y negocio creado exitosamente');
          }
        } else {
          toast.success('Cuenta verificada exitosamente');
        }
        
        router.push('/admin/dashboard');
      } else {
        toast.success('Código verificado, ahora cambia tu contraseña');
        router.push('/reset-password');
      }
    } catch (err) {
      toast.error(err.message || 'Código inválido o expirado');
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
              <span className="text-primary">
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
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">1. Revisa tu correo</h3>
                <p className="text-xs text-foreground/60">Busca el email de verificación en tu bandeja</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <KeyRound className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">2. Ingresa el código</h3>
                <p className="text-xs text-foreground/60">Copia el código de 8 dígitos</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">
                  3. {type === 'signup' ? 'Activa tu cuenta' : 'Cambia tu contraseña'}
                </h3>
                <p className="text-xs text-foreground/60">
                  {type === 'signup' ? 'Completa el registro de tu negocio' : 'Crea una nueva contraseña segura'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-foreground/10">
            <p className="text-xs text-foreground font-bold leading-relaxed">
              <span className="text-primary text-sm">Aviso:</span> Usuario responsable de obligaciones fiscales. 
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">
                {type === 'signup' ? 'Verificación de Registro' : 'Recuperación de Contraseña'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Verifica tu código
            </h2>
            <p className="text-sm text-foreground/60">
              Ingresa el código de 8 dígitos enviado a
            </p>
            <p className="text-sm font-bold text-primary break-all">
              {email}
            </p>
          </div>

          <form onSubmit={handleVerificar} className="space-y-5">
            {/* Inputs de código separados - 8 dígitos */}
            <div className="flex justify-center gap-1.5 sm:gap-2">
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
                    inputWrapper: "w-9 h-12 sm:w-12 sm:h-14 border-2 data-[focus=true]:border-primary data-[hover=true]:border-default-400"
                  }}
                />
              ))}
            </div>

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="w-full font-semibold text-sm sm:text-base min-h-[52px]"
              isLoading={isLoading}
              startContent={!isLoading && <CheckCircle2 className="w-5 h-5" />}
            >
              {isLoading ? 'Verificando...' : 'Verificar código'}
            </Button>
          </form>

          {/* Card de Reenvío */}
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
                      Podrás reenviar en <span className="font-bold text-primary">{countdown}</span> segundos
                    </p>
                  ) : (
                    <Button
                      size="sm"
                      variant="flat"
                      color="primary"
                      onClick={handleReenviar}
                      startContent={<RefreshCw className="w-4 h-4" />}
                      className="mt-1 font-semibold"
                    >
                      Reenviar código
                    </Button>
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
                className="text-foreground/60 hover:text-foreground font-medium"
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
