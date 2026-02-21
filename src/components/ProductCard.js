'use client';

import { Card, CardBody, Badge, Button, addToast } from '@heroui/react';
import { Copy } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  setSearchTerm, 
  monedaActual,
  stockActual = product.stock,
  cantidadEnCarrito = 0
}) {
  // Determinar el color de fondo según el stock
  const getBackgroundClass = () => {
    if (stockActual === 0) return 'bg-danger-50';
    if (stockActual > 0 && stockActual <= 5) return 'bg-warning-50';
    return 'bg-white';
  };

  // Determinar el color del badge de stock
  const getStockBadgeColor = () => {
    if (stockActual === 0) return 'danger';
    if (stockActual > 0 && stockActual <= 5) return 'warning';
    return 'success';
  };

  // Manejar el click en agregar al carrito
  const handleAddToCart = () => {
    // Validar si hay stock disponible
    if (stockActual === 0) {
      addToast({
        title: 'Producto agotado',
        description: 'Producto agotado en el inventario',
        variant: 'solid',
        color: 'danger',
      });
      return;
    }

    // Si es la primera vez que se agrega (no existe en carrito)
    if (cantidadEnCarrito === 0) {
      addToast({
        title: product.nombre,
        description: `${product.nombre} agregado al carrito`,
        variant: 'solid',
        color: 'success',
      });
    } else {
      // Si ya existe en el carrito, mostrar toast info
      addToast({
        title: 'Cantidad actualizada',
        description: `Cantidad actualizada: ${cantidadEnCarrito + 1} unidades`,
        variant: 'solid',
        color: 'primary', // Hero UI usa 'primary' para info
      });
    }
    
    // Llamar a la función del padre para manejar el estado global
    onAddToCart(product);
  };

  // Copiar código de barras y actualizar búsqueda
  const handleCopyBarcode = (e) => {
    e.stopPropagation(); // Evitar que se active el click de la card
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(product.codigo).then(() => {
      addToast({
        title: 'Código copiado',
        description: `Código ${product.codigo} copiado al portapapeles`,
        variant: 'solid',
        color: 'secondary',
      });
      
      // Actualizar el buscador global
      setSearchTerm(product.codigo);
    }).catch(() => {
      addToast({
        title: 'Error',
        description: 'No se pudo copiar el código',
        variant: 'solid',
        color: 'danger',
      });
    });
  };

  return (
    <Card 
      isPressable
      onPress={handleAddToCart}
      className={`border border-divider hover:border-primary hover:shadow-md transition-all relative ${getBackgroundClass()}`}
    >
      <CardBody className="p-3 sm:p-4 gap-3">
        {/* Badge de Stock en la esquina superior derecha */}
        <div className="absolute top-2 right-2 z-10">
          <Badge 
            content={stockActual} 
            color={getStockBadgeColor()}
            variant="flat"
            size="sm"
            className="font-bold"
          />
        </div>

        {/* Badge de AGOTADO en el centro exacto (solo si stock = 0) */}
        {stockActual === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <Badge 
              content="PRODUCTO AGOTADO"
              color="danger"
              variant="flat"
              size="lg"
              className="font-bold text-xs sm:text-sm px-3 py-2"
            />
          </div>
        )}

        {/* Nombre del Producto - Tipografía semibold */}
        <h3 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 min-h-[32px] leading-tight pr-12">
          {product.nombre}
        </h3>

        {/* Precio - Tamaño de fuente mayor */}
        <div>
          <p className="text-[9px] text-foreground/60 font-bold uppercase tracking-wider mb-1">
            Precio
          </p>
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {monedaActual?.simbolo}{product.precio.toFixed(2)}
          </p>
        </div>

        {/* Footer: Código de Barras y Botón de Copiar - Buen spacing para táctil */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-divider/50 mt-auto">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-foreground/60 font-bold uppercase tracking-wider mb-0.5">
              Código
            </p>
            <p className="text-[10px] text-primary font-mono truncate">
              {product.codigo}
            </p>
          </div>
          
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            color="secondary"
            onPress={handleCopyBarcode}
            className="flex-shrink-0 h-9 w-9 min-w-9 min-h-9" // Buen spacing táctil
            aria-label="Copiar código de barras"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
