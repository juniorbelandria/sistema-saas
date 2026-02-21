'use client'; // OBLIGATORIO

import { Card, CardBody, Button, Tooltip, Chip } from '@heroui/react';
import { addToast } from '@heroui/toast';
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

  // Clases dinámicas según stock para el fondo de la card
  const cardBgClass = isOutOfStock
    ? 'bg-danger-50'
    : isLowStock
    ? 'bg-warning-50'
    : 'bg-content1';

  // Color del badge de stock personalizado
  const getStockBadgeColor = () => {
    if (isOutOfStock) return 'bg-danger';
    if (isLowStock) return 'bg-warning';
    return 'bg-success';
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
        title: 'Producto agregado',
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
    <Card
      isPressable={!isOutOfStock}
      onPress={handleAddToCart}
      shadow="sm"
      className={`w-full h-full border-1 border-divider ${cardBgClass} transition-all active:scale-95 relative`}
    >
      <CardBody className="p-2 flex flex-col justify-between gap-1 relative overflow-visible">
        
        {/* Badge de Stock personalizado - DENTRO de la Card */}
        <div className={`absolute top-0 right-2 px-2 py-0.5 rounded-b-lg text-[10px] font-bold text-white z-10 ${getStockBadgeColor()}`}>
          STOCK: {stockActual}
        </div>

        {/* Overlay de Agotado con Chip - Solo si stock = 0 */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-danger-100/40 backdrop-blur-[1px] pointer-events-none">
            <Chip 
              color="danger" 
              variant="solid"
              size="lg"
              className="font-black uppercase rotate-[-12deg] shadow-lg"
            >
              Agotado
            </Chip>
          </div>
        )}

        {/* Info Producto */}
        <div className="flex flex-col gap-0.5 mt-5">
          <h3 className="text-xs font-bold line-clamp-2 leading-tight uppercase text-foreground min-h-[32px]">
            {product.nombre}
          </h3>
          <p className="text-lg font-black text-primary">
            {monedaActual?.simbolo}{product.precio.toFixed(2)}
          </p>
        </div>

        {/* Footer: Código y Botón de Copiar */}
        <div className="mt-2 pt-2 border-t border-divider/50 flex items-center justify-between gap-1">
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="text-[9px] uppercase text-foreground font-black">Código</span>
            <span className="text-[10px] font-mono truncate text-foreground">{product.codigo}</span>
          </div>

          <Tooltip content="Copiar y buscar" size="sm" placement="top">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              color="secondary"
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
  );
}
