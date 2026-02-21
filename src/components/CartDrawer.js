'use client';

import { useMemo, useState } from 'react';
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
import PaymentMethodSelector from './PaymentMethodSelector';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  carrito, 
  onRemoveItem,
  monedaActual,
  ivaPercentage,
  onIvaChange,
  onOpenPaymentModal
}) {
  const [selectedMethod, setSelectedMethod] = useState('efectivo');

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

  const handleFinalizarCompra = () => {
    onOpenPaymentModal({
      method: selectedMethod,
      total
    });
  };

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
      <DrawerContent className="bg-content1 flex flex-col">
        {/* Header Sticky */}
        <DrawerHeader className="flex flex-col gap-1 border-b border-divider flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">Carrito de Venta</h2>
              <p className="text-xs text-foreground/60 font-normal">
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
        </DrawerHeader>

        {/* Body con flex-1 para ocupar todo el espacio */}
        <DrawerBody className="flex-1 flex flex-col py-0 px-0">
          {itemsCarrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <ShoppingBag className="w-16 h-16 text-default-300 mb-4" />
              <p className="text-sm text-foreground/60">Tu carrito está vacío</p>
              <p className="text-xs text-foreground/40 mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Lista de Productos - Cards elegantes */}
              <div className="flex-1 overflow-y-auto px-3 py-3">
                <div className="space-y-2">
                  {itemsCarrito.map((item) => (
                    <Card 
                      key={item.producto.id}
                      shadow="sm"
                      className="border border-divider hover:border-primary/50 transition-all"
                    >
                      <CardBody className="p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold truncate mb-1">
                              {item.producto.nombre}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-foreground/60">
                              <span>{monedaActual?.simbolo}{item.producto.precio.toFixed(2)}</span>
                              <span>×</span>
                              <span className="font-semibold">{item.cantidad}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-base font-bold text-primary">
                                {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                              </p>
                            </div>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="flat"
                              color="danger"
                              onPress={() => onRemoveItem(item.producto.id)}
                              className="min-w-8 w-8 h-8"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sección de Totales y Pago - Siempre al fondo */}
              <div className="flex-shrink-0 border-t-2 border-divider bg-content1">
                <div className="px-4 py-4 space-y-4">
                  {/* IVA Input - Compacto y alineado a la derecha */}
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs font-semibold text-foreground/80">
                      {monedaActual?.impuesto || 'IVA'}:
                    </span>
                    <Input
                      type="number"
                      value={ivaPercentage.toString()}
                      onValueChange={(value) => onIvaChange(parseFloat(value) || 0)}
                      variant="bordered"
                      size="sm"
                      min="0"
                      max="100"
                      step="0.1"
                      endContent={<span className="text-xs text-foreground/60 font-semibold">%</span>}
                      classNames={{
                        base: "max-w-[100px]",
                        input: "text-sm font-bold text-center",
                        inputWrapper: "h-8 border-default-300"
                      }}
                    />
                  </div>

                  {/* Resumen de Totales - Card elegante con tema adaptable */}
                  <Card shadow="sm" className="bg-content2 border border-divider">
                    <CardBody className="p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">Subtotal:</span>
                        <span className="font-semibold text-foreground">
                          {monedaActual?.simbolo}{subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/70">
                          {monedaActual?.impuesto || 'IVA'} ({ivaPercentage}%):
                        </span>
                        <span className="font-semibold text-foreground">
                          {monedaActual?.simbolo}{iva.toFixed(2)}
                        </span>
                      </div>
                      <Divider className="my-1" />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-foreground">Total:</span>
                        <span className="text-2xl font-bold text-primary">
                          {monedaActual?.simbolo}{total.toFixed(2)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Método de Pago */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground/90">Método de Pago</h3>
                    <PaymentMethodSelector
                      selectedMethod={selectedMethod}
                      onSelectMethod={setSelectedMethod}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </DrawerBody>

        {/* Footer Sticky - Siempre visible */}
        {itemsCarrito.length > 0 && (
          <DrawerFooter className="border-t-2 border-divider pt-3 pb-3 flex-shrink-0 bg-content1">
            <Button
              color={selectedMethod ? "primary" : "default"}
              size="lg"
              className="w-full font-bold text-sm shadow-lg"
              onPress={handleFinalizarCompra}
              isDisabled={!selectedMethod}
              startContent={<CreditCard className="w-5 h-5" />}
            >
              Procesar Pago
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
