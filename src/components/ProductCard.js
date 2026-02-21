'use client';

import { Card, CardBody, Badge, Button, Tooltip, addToast } from '@heroui/react';
import { Copy } from 'lucide-react';

export default function ProductCard({ 
  product, 
  onAddToCart, 
  setSearchTerm, 
  monedaActual,
  stockActual = product.stock,
  cantidadEnCarrito = 0
}) {
  const isLowStock = stockActual > 0 && stockActual <= 5;
  const isOutOfStock = stockActual === 0;

  // Clases dinámicas según stock
  const cardBgClass = isOutOfStock
    ? 'bg-danger-50 border-danger-200'
    : isLowStock
    ? 'bg-warning-50 border-warning-200'
    : 'bg-content1';

  // Determinar el color del badge de stock
  const getStockBadgeColor = () => {
    if (isOutOfStock) return 'danger';
    if (isLowStock) return 'warning';
    return 'success';
  };

  // Manejar el click en agregar al carrito
  const handleAddToCart = () => {
    // Validar si hay stock disponible
    if (isOutOfStock) {
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
        color: 'primary',
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
    <Badge
      content={stockActual}
      color={getStockBadgeColor()}
      placement="top-right"
      size="sm"
      className="z-20 font-bold w-full"
    >
      <Card
        isPressable={!isOutOfStock}
        onPress={handleAddToCart}
        shadow="sm"
        className={`w-full h-full border-1 ${cardBgClass} transition-all active:scale-95`}
      >
        <CardBody className="relative flex flex-col justify-between gap-1 overflow-hidden p-2 sm:p-3">
          
          {/* Overlay de Agotado - Mejorado para que no estorbe */}
          {isOutOfStock && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-danger-100/40 backdrop-blur-[1px]">
              <div className="bg-danger-600 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-lg rotate-[-12deg] uppercase">
                Agotado
              </div>
            </div>
          )}

          {/* Info Producto */}
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[11px] sm:text-xs font-bold truncate leading-tight uppercase">
              {product.nombre}
            </h3>
            <p className="text-base sm:text-lg font-black text-primary">
              {monedaActual?.simbolo}{product.precio.toFixed(2)}
            </p>
          </div>

          {/* Footer: Código y Copiar */}
          <div className="mt-2 pt-2 border-t border-default-200 flex items-center justify-between gap-1">
            <div className="flex flex-col overflow-hidden">
              <span className="text-[9px] uppercase text-default-500 font-bold">Código</span>
              <span className="text-[10px] font-mono truncate">{product.codigo}</span>
            </div>

            <Tooltip content="Copiar y buscar" size="sm">
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                radius="full"
                className="min-w-8 w-8 h-8"
                onPress={handleCopyBarcode}
                aria-label="Copiar código de barras"
              >
                <Copy size={14} />
              </Button>
            </Tooltip>
          </div>
        </CardBody>
      </Card>
    </Badge>
  );
}
