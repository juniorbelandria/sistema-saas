'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-content1 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Icono animado */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-danger/20 to-warning/20 flex items-center justify-center animate-pulse">
              <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-danger" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-danger/10 to-warning/10 animate-ping"></div>
          </div>
        </div>

        {/* Código 404 */}
        <h1 className="text-8xl md:text-[12rem] font-bold text-primary mb-6" style={{ color: '#0070F3' }}>
          404
        </h1>

        {/* Mensaje */}
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Página no encontrada
        </h2>
        <p className="text-foreground/60 text-base md:text-lg mb-10 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación.
        </p>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            color="primary"
            startContent={<ArrowLeft className="w-5 h-5" />}
            onClick={() => router.back()}
            className="w-full sm:w-auto shadow-lg shadow-primary/30 font-semibold"
          >
            Regresar
          </Button>
          
          <Button
            size="lg"
            variant="bordered"
            startContent={<Home className="w-5 h-5" />}
            as={Link}
            href="/"
            className="w-full sm:w-auto font-semibold"
          >
            Ir al inicio
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-16">
          <p className="text-xs text-foreground/40">
            Error 404 - Sistema POS
          </p>
        </div>
      </div>
    </div>
  );
}
