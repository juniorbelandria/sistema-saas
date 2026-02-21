'use client';

import { useMemo } from 'react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Card,
  CardBody,
  Input,
  Divider
} from '@heroui/react';
import { Trash2, ShoppingBag, CreditCard } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  carrito, 
  onRemoveItem,
  monedaActual,
  ivaPercentage,
  onIvaChange,
  onProceedToPayment
}) {
  // Calcular totales con precisión de 2 decimales
  const { subtotal, iva, total } = useMemo(() => {
    const items = Object.values(carrito);
    const sub = items.reduce((sum, item) => {
      return sum + (item.producto.precio * item.cantidad);
    }, 0);
    const ivaAmount = sub * (ivaPercentage / 100);
    const tot = sub + ivaAmount;
    
    return {
      subtotal: Number(sub.toFixed(2)),
      iva: Number(ivaAmount.toFixed(2)),
      total: Number(tot.toFixed(2))
    };
  }, [carrito, ivaPercentage]);

  const itemsCarrito = Object.values(carrito);
  const totalItems = itemsCarrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="full"
      classNames={{
        base: "w-full sm:max-w-md",
        backdrop: "bg-black/50"
      }}
    >
      <DrawerContent className="bg-content1">
        {/* Header - Sin botón X manual, usa el del Drawer */}
        <DrawerHeader className="flex flex-col gap-1 border-b border-divider">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">Detalle de Venta</h2>
              <p className="text-xs text-foreground/60 font-normal">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
        </DrawerHeader>

        {/* Body */}
        <DrawerBody className="py-4 px-4">
          {itemsCarrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-default-300 mb-4" />
              <p className="text-sm text-foreground/60">Tu carrito está vacío</p>
              <p className="text-xs text-foreground/40 mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {itemsCarrito.map((item) => (
                <Card 
                  key={item.producto.id}
                  shadow="none"
                  className="bg-content2 border border-divider"
                >
                  <CardBody className="p-2.5 sm:p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-semibold truncate">
                          {item.producto.nombre}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-foreground/60 mt-0.5">
                          {monedaActual?.simbolo}{item.producto.precio.toFixed(2)} × {item.cantidad}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <p className="text-xs sm:text-sm font-bold text-primary whitespace-nowrap">
                          {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => onRemoveItem(item.producto.id)}
                          className="min-w-5 w-5 h-5 sm:min-w-6 sm:w-6 sm:h-6"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {itemsCarrito.length > 0 && (
            <>
              <Divider className="my-4" />

              {/* IVA Input */}
              <div className="space-y-3">
                <Input
                  type="number"
                  label={`${monedaActual?.impuesto || 'IVA'} (%)`}
                  value={ivaPercentage.toString()}
                  onValueChange={(value) => onIvaChange(parseFloat(value) || 0)}
                  variant="bordered"
                  size="sm"
                  min="0"
                  max="100"
                  step="0.1"
                  classNames={{
                    input: "text-xs sm:text-sm",
                    label: "text-[10px] sm:text-xs font-semibold"
                  }}
                />

                {/* Resumen de Totales */}
                <Card shadow="none" className="bg-content2">
                  <CardBody className="p-2.5 sm:p-3 space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-foreground/70">Subtotal:</span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-foreground/70">
                        {monedaActual?.impuesto || 'IVA'} ({ivaPercentage}%):
                      </span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{iva.toFixed(2)}
                      </span>
                    </div>
                    <Divider />
                    <div className="flex justify-between">
                      <span className="text-base sm:text-lg font-bold">Total:</span>
                      <span className="text-xl sm:text-2xl font-bold text-primary">
                        {monedaActual?.simbolo}{total.toFixed(2)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </>
          )}
        </DrawerBody>

        {/* Footer */}
        {itemsCarrito.length > 0 && (
          <DrawerFooter className="border-t border-divider pt-3">
            <Button
              color="primary"
              size="lg"
              className="w-full font-bold text-sm sm:text-base"
              onPress={onProceedToPayment}
              startContent={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              Procesar Venta
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
