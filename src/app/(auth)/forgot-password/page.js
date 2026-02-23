'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, CardBody } from '@heroui/react';
import { Mail, ArrowLeft, Send, CheckCircle2, Shield, Clock, Key } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('Código de seguridad enviado');
      router.push(`/verify-email?email=${encodeURIComponent(email)}&type=recovery`);
    } catch (error) {
      console.error('Error al enviar código:', error);
      toast.error(error.message || 'Error al enviar el código de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReenviar = () => {
    setEnviado(false);
    setEmail('');
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
          {/* Logo y Título */}
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
              Recupera el acceso a{' '}
              <span className="text-primary">tu cuenta</span>
            </h2>
            
            <p className="text-xs text-foreground/70 leading-relaxed">
              No te preocupes, es normal olvidar tu contraseña. Te enviaremos un enlace 
              seguro para que puedas crear una nueva y volver a gestionar tu negocio.
            </p>
          </div>

          {/* Proceso de recuperación */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">1. Ingresa tu correo</h3>
                <p className="text-xs text-foreground/60">Escribe el email asociado a tu cuenta</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <Send className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">2. Revisa tu bandeja</h3>
                <p className="text-xs text-foreground/60">Te enviaremos un enlace de recuperación</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <Key className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">3. Crea tu nueva contraseña</h3>
                <p className="text-xs text-foreground/60">Haz clic en el enlace y establece una nueva contraseña segura</p>
              </div>
            </div>
          </div>

          {/* Información de seguridad */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold text-primary mb-1">Seguridad garantizada</p>
              <p className="text-xs text-foreground/70 leading-relaxed">
                El enlace de recuperación expira en 1 hora y solo puede usarse una vez. 
                Tus datos están protegidos con encriptación de nivel bancario.
              </p>
            </div>
          </div>

          {/* Disclaimer Legal */}
          <div className="pt-4 mt-6 border-t border-foreground/10">
            <p className="text-xs text-foreground font-bold leading-relaxed">
              <span className="text-primary text-sm">Aviso:</span> Usuario responsable de obligaciones fiscales. 
              Sistema no certifica ante autoridades tributarias. Datos ingresados son responsabilidad del negocio.
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

          {!enviado ? (
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  ¿Olvidaste tu contraseña?
                </h2>
                <p className="text-sm text-foreground/60">
                  Ingresa tu correo y te enviaremos un enlace para recuperarla
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleEnviar} className="space-y-5">
                <Input
                  type="email"
                  label="Correo Electrónico"
                  placeholder="tu@email.com"
                  value={email}
                  onValueChange={setEmail}
                  startContent={<Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
                  variant="bordered"
                  size="lg"
                  isRequired
                  autoComplete="email"
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
                  className="w-full font-semibold text-sm sm:text-base min-h-[52px]"
                  startContent={!isLoading && <Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </form>

              {/* Información adicional */}
              <Card className="border-none shadow-sm bg-content2">
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground mb-1">
                        El enlace expira en 1 hora
                      </p>
                      <p className="text-xs text-foreground/60 leading-relaxed">
                        Por seguridad, el enlace de recuperación solo estará activo durante 60 minutos.
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Volver al login */}
              <div className="text-center">
                <Link href="/">
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
            </>
          ) : (
            <>
              {/* Confirmación de envío */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    ¡Correo enviado!
                  </h2>
                  <p className="text-sm text-foreground/60">
                    Hemos enviado un enlace de recuperación a
                  </p>
                  <p className="text-sm font-bold text-primary">
                    {email}
                  </p>
                </div>
              </div>

              {/* Instrucciones */}
              <Card className="border-none shadow-sm bg-content2">
                <CardBody className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">1</span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      Revisa tu bandeja de entrada y la carpeta de spam
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">2</span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      Haz clic en el enlace del correo (válido por 1 hora)
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-xs font-bold">3</span>
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">
                      Crea tu nueva contraseña y accede a tu cuenta
                    </p>
                  </div>
                </CardBody>
              </Card>

              {/* Acciones */}
              <div className="space-y-3">
                <Button
                  size="lg"
                  color="primary"
                  variant="flat"
                  className="w-full font-semibold text-sm sm:text-base min-h-[52px]"
                  onPress={handleReenviar}
                  startContent={<Send className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  Enviar nuevamente
                </Button>

                <Link href="/" className="block">
                  <Button
                    variant="light"
                    size="sm"
                    startContent={<ArrowLeft className="w-4 h-4" />}
                    className="w-full text-foreground/60 hover:text-foreground"
                  >
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
