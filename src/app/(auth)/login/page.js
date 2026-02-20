'use client';

import { useState } from 'react';
import { Button, Input, Checkbox } from '@heroui/react';
import { Eye, EyeOff, Lock, Mail, LogIn, Shield, TrendingUp, Globe, Zap, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';
import TerminosModal from '@/components/TerminosModal';
import PrivacidadModal from '@/components/PrivacidadModal';
import DevNavigation from '@/components/DevNavigation';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isTerminosOpen, setIsTerminosOpen] = useState(false);
  const [isPrivacidadOpen, setIsPrivacidadOpen] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
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
              La plataforma de gestión{' '}
              <span className="text-primary">más confiable del mercado</span>
            </h2>
            
            <p className="text-xs text-foreground/70 leading-relaxed">
              Únete y forma parte de nuestra plataforma innovadora de punto de venta. 
              Maneja más de 30 monedas a nivel mundial y expande tu negocio sin fronteras desde el primer día.
            </p>
          </div>

          {/* Features List */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <Shield className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Conexión Segura</h3>
                <p className="text-xs text-foreground/60">Tus datos protegidos con encriptación de nivel bancario</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Aumenta tus Ventas</h3>
                <p className="text-xs text-foreground/60">Controla y optimiza cada transacción con análisis en tiempo real</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">30+ Monedas Globales</h3>
                <p className="text-xs text-foreground/60">Opera con USD, EUR, Bolívares, Pesos y más monedas internacionales</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <Zap className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Rápido y Eficiente</h3>
                <p className="text-xs text-foreground/60">Procesa ventas en segundos y atiende más clientes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-background" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">Reportes Claros</h3>
                <p className="text-xs text-foreground/60">Visualiza el rendimiento de tu negocio al instante</p>
              </div>
            </div>
          </div>

          {/* Disclaimer Legal - Más legible */}
          <div className="pt-4 border-t border-foreground/10">
            <p className="text-xs text-foreground font-bold leading-relaxed">
              <span className="text-primary text-sm">Aviso:</span> Usuario responsable de obligaciones fiscales. 
              Sistema no certifica ante autoridades tributarias. Datos ingresados son responsabilidad del negocio.
            </p>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Login Form */}
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

          {/* Login Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Bienvenido de vuelta
            </h2>
            <p className="text-sm text-foreground/60">
              Accede a tu sistema de punto de venta
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
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
              autoComplete="off"
              classNames={{
                label: "text-foreground font-bold",
                input: "text-foreground",
                inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
              }}
            />

            <Input
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              value={password}
              onValueChange={setPassword}
              startContent={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
              endContent={
                <button type="button" onClick={toggleVisibility} className="focus:outline-none p-2">
                  {isVisible ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              }
              type={isVisible ? 'text' : 'password'}
              variant="bordered"
              size="lg"
              isRequired
              autoComplete="off"
              classNames={{
                label: "text-foreground font-bold",
                input: "text-foreground",
                inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
              }}
            />

            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-0">
              <Checkbox size="sm">
                <span className="text-xs sm:text-sm text-foreground/70">
                  Mantener sesión iniciada
                </span>
              </Checkbox>
              <a
                href="/forgot-password"
                className="text-xs sm:text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="w-full font-semibold text-sm sm:text-base min-h-[52px]"
              startContent={<LogIn className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              Iniciar Sesión
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-foreground/60">
            ¿Aún no tienes una cuenta?{' '}
            <a href="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Registra tu negocio gratis
            </a>
          </div>
          
          <div className="text-center text-xs text-foreground/50">
            Al continuar, aceptas nuestros{' '}
            <button 
              onClick={() => setIsTerminosOpen(true)}
              className="text-primary hover:text-primary/80 underline font-medium transition-colors"
            >
              Términos
            </button>
            {' '}y{' '}
            <button 
              onClick={() => setIsPrivacidadOpen(true)}
              className="text-primary hover:text-primary/80 underline font-medium transition-colors"
            >
              Política de Privacidad
            </button>
          </div>
        </div>
      </div>

      {/* Modales */}
      <TerminosModal isOpen={isTerminosOpen} onClose={() => setIsTerminosOpen(false)} />
      <PrivacidadModal isOpen={isPrivacidadOpen} onClose={() => setIsPrivacidadOpen(false)} />
    </div>
  );
}
