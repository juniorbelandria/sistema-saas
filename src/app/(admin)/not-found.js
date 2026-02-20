'use client';

import { useRouter } from 'next/navigation';
import { Card, CardBody, Button } from '@heroui/react';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl border-none bg-gradient-to-br from-content1 to-content2">
          <CardBody className="p-8 md:p-12 text-center">
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
            <h1 className="text-7xl md:text-9xl font-bold bg-gradient-to-r from-danger via-warning to-primary bg-clip-text text-transparent mb-4">
              404
            </h1>

            {/* Mensaje */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Página no encontrada
            </h2>
            <p className="text-foreground/60 text-base md:text-lg mb-8 max-w-md mx-auto">
              Esta sección del panel de administración no existe o no está disponible.
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button
                size="lg"
                color="primary"
                startContent={<ArrowLeft className="w-5 h-5" />}
                onClick={() => router.back()}
                className="w-full sm:w-auto shadow-lg shadow-primary/30"
              >
                Regresar
              </Button>
              
              <Button
                size="lg"
                variant="flat"
                startContent={<Home className="w-5 h-5" />}
                as={Link}
                href="/admin/dashboard"
                className="w-full sm:w-auto"
              >
                Ir al Dashboard
              </Button>
            </div>

            {/* Sugerencias */}
            <div className="mt-12 pt-8 border-t border-divider/50">
              <p className="text-sm text-foreground/60 mb-4">Accesos rápidos</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/admin/ventas/nueva">
                  <span className="text-xs px-3 py-1.5 bg-content2 hover:bg-content3 rounded-full transition-colors cursor-pointer">
                    Nueva Venta
                  </span>
                </Link>
                <Link href="/admin/productos">
                  <span className="text-xs px-3 py-1.5 bg-content2 hover:bg-content3 rounded-full transition-colors cursor-pointer">
                    Productos
                  </span>
                </Link>
                <Link href="/admin/clientes">
                  <span className="text-xs px-3 py-1.5 bg-content2 hover:bg-content3 rounded-full transition-colors cursor-pointer">
                    Clientes
                  </span>
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
