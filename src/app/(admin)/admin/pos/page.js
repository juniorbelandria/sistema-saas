'use client';

import { useState } from 'react';
import { Select, SelectItem, Button, Badge, Avatar } from '@heroui/react';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';

const PAISES = [
  { codigo: 've', nombre: 'Venezuela', moneda: 'VES', simbolo: 'Bs.', impuesto: 'IVA', tasa: 16 },
  { codigo: 'mx', nombre: 'México', moneda: 'MXN', simbolo: '$', impuesto: 'IVA', tasa: 16 },
  { codigo: 'co', nombre: 'Colombia', moneda: 'COP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'us', nombre: 'Estados Unidos', moneda: 'USD', simbolo: '$', impuesto: 'Sales Tax', tasa: 0 },
  { codigo: 'pe', nombre: 'Perú', moneda: 'PEN', simbolo: 'S/', impuesto: 'IGV', tasa: 18 },
  { codigo: 'ar', nombre: 'Argentina', moneda: 'ARS', simbolo: '$', impuesto: 'IVA', tasa: 21 },
  { codigo: 'cl', nombre: 'Chile', moneda: 'CLP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'ec', nombre: 'Ecuador', moneda: 'USD', simbolo: '$', impuesto: 'IVA', tasa: 12 },
  { codigo: 'es', nombre: 'España', moneda: 'EUR', simbolo: '€', impuesto: 'IVA', tasa: 21 },
];

export default function POSPage() {
  const [monedaSeleccionada, setMonedaSeleccionada] = useState('ve');
  const [itemsCarrito, setItemsCarrito] = useState(4);

  return (
    <div className="min-h-screen bg-default-100">
      {/* Header */}
      <header className="bg-background border-b border-divider sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Logo y Título */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
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
              <h1 className="text-sm sm:text-base lg:text-lg font-bold text-foreground">
                POS Venta
              </h1>
            </div>

            {/* Select de Moneda y Carrito */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Select de Moneda */}
              <Select
                selectedKeys={monedaSeleccionada ? [monedaSeleccionada] : []}
                onChange={(e) => setMonedaSeleccionada(e.target.value)}
                variant="bordered"
                size="sm"
                className="w-32 sm:w-40 lg:w-48"
                classNames={{
                  trigger: "h-9 sm:h-10 min-h-[36px] sm:min-h-[40px]",
                  value: "text-xs sm:text-sm"
                }}
                aria-label="Seleccionar moneda"
              >
                {PAISES.map((pais) => (
                  <SelectItem 
                    key={pais.codigo} 
                    value={pais.codigo}
                    startContent={
                      <Avatar 
                        alt={pais.nombre} 
                        className="w-5 h-5" 
                        src={`https://flagcdn.com/${pais.codigo}.svg`} 
                      />
                    }
                  >
                    {pais.moneda} ({pais.simbolo})
                  </SelectItem>
                ))}
              </Select>

              {/* Botón Ver Carrito */}
              <Badge 
                content={itemsCarrito} 
                color="primary" 
                size="sm"
                placement="top-right"
              >
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="h-9 sm:h-10 px-3 sm:px-4"
                  startContent={<ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
                >
                  <span className="hidden sm:inline text-xs sm:text-sm">Ver Carrito</span>
                </Button>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Aquí irá el contenido del POS */}
      </main>
    </div>
  );
}
