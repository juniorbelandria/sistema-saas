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
  const [monedaSeleccionada, setMonedaSeleccionada] = useState(new Set(['us']));
  const [itemsCarrito, setItemsCarrito] = useState(4);

  const monedaActual = PAISES.find(p => p.codigo === Array.from(monedaSeleccionada)[0]);

  return (
    <div className="min-h-screen bg-default-100">
      {/* Header */}
      <header className="bg-background border-b border-divider sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-12 sm:h-14 gap-3">
            {/* Logo y Título */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="relative w-7 h-7 sm:w-8 sm:h-8">
                <Image
                  src="/assets/imagenes/logonegro.webp"
                  alt="Sistema POS"
                  width={32}
                  height={32}
                  className="object-contain"
                  priority
                  quality={85}
                />
              </div>
              <h1 className="text-sm sm:text-base font-bold text-foreground">
                POS Venta
              </h1>
            </div>

            {/* Select de Moneda y Carrito */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Select de Moneda */}
              <Select
                selectedKeys={monedaSeleccionada}
                onSelectionChange={setMonedaSeleccionada}
                variant="bordered"
                size="sm"
                className="w-24 sm:w-28"
                classNames={{
                  trigger: "h-8 sm:h-9 min-h-[32px] sm:min-h-[36px]",
                  value: "text-xs sm:text-sm font-semibold"
                }}
                aria-label="Seleccionar moneda"
                renderValue={() => (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold">
                      {monedaActual?.moneda}
                    </span>
                  </div>
                )}
              >
                {PAISES.map((pais) => (
                  <SelectItem 
                    key={pais.codigo} 
                    value={pais.codigo}
                    textValue={`${pais.moneda} ${pais.nombre}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{pais.simbolo}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold">{pais.moneda}</span>
                        <span className="text-xs text-foreground/60">{pais.nombre}</span>
                      </div>
                    </div>
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
                  size="sm"
                  className="h-8 sm:h-9 px-2 sm:px-3"
                  startContent={<ShoppingCart className="w-4 h-4" />}
                >
                  <span className="hidden sm:inline text-xs">Carrito</span>
                </Button>
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Aquí irá el contenido del POS */}
      </main>
    </div>
  );
}
