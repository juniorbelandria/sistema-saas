'use client';

import { useMemo } from 'react';
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  Button,
  Card,
  CardBody,
  Input,
  Divider
} from '@heroui/react';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  carrito, 
  onRemoveItem,
  onUpdateQuantity,
  monedaActual,
  ivaPercentage,
  onIvaChange,
  onProceedToPayment
}) {
  // Calcular totales
  const { subtotal, iva, total } = useMemo(() => {
    const items = Object.values(carrito);
    const sub = items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0);
    const ivaAmount = sub * (ivaPercentage / 100);
    const tot = sub + ivaAmount;
    
    return {
      subtotal: sub,
      iva: ivaAmount,
      total: tot
    };
  }, [carrito, ivaPercentage]);

  const itemsCarrito = Object.values(carrito);
  const totalItems = itemsCarrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      placement="right"
      scrollBehavior="inside"
      classNames={{
        base: "max-w-md m-0 h-screen rounded-none",
        wrapper: "items-start justify-end",
        backdrop: "bg-black/50"
      }}
    >
      <ModalContent className="bg-content1">
        {(onClose) => (
          <>
            {/* Header */}
            <ModalHeader className="flex items-center justify-between border-b border-divider pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-lg font-bold">Detalle de Venta</h2>
                  <p className="text-xs text-foreground/60 font-normal">
                    {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                  </p>
                </div>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="text-foreground/60 hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </ModalHeader>

            {/* Body */}
            <ModalBody className="py-4 px-4">
              {itemsCarrito.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-default-300 mb-4" />
                  <p className="text-foreground/60">Tu carrito está vacío</p>
                  <p className="text-sm text-foreground/40 mt-1">Agrega productos para comenzar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {itemsCarrito.map((item) => (
                    <Card 
                      key={item.producto.id}
                      shadow="none"
                      className="bg-content2 border border-divider"
                    >
                      <CardBody className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold truncate">
                              {item.producto.nombre}
                            </h3>
                            <p className="text-xs text-foreground/60 mt-0.5">
                              {monedaActual?.simbolo}{item.producto.precio.toFixed(2)} × {item.cantidad}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-primary whitespace-nowrap">
                              {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                            </p>
                            <Button
                              isIconOnly
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => onRemoveItem(item.producto.id)}
                              className="min-w-6 w-6 h-6"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
                        input: "text-sm",
                        label: "text-xs font-semibold"
                      }}
                    />

                    {/* Resumen de Totales */}
                    <Card shadow="none" className="bg-content2">
                      <CardBody className="p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">Subtotal:</span>
                          <span className="font-semibold">
                            {monedaActual?.simbolo}{subtotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-foreground/70">
                            {monedaActual?.impuesto || 'IVA'} ({ivaPercentage}%):
                          </span>
                          <span className="font-semibold">
                            {monedaActual?.simbolo}{iva.toFixed(2)}
                          </span>
                        </div>
                        <Divider />
                        <div className="flex justify-between">
                          <span className="text-lg font-bold">Total:</span>
                          <span className="text-2xl font-bold text-primary">
                            {monedaActual?.simbolo}{total.toFixed(2)}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </>
              )}
            </ModalBody>

            {/* Footer */}
            {itemsCarrito.length > 0 && (
              <ModalFooter className="border-t border-divider pt-3">
                <Button
                  color="primary"
                  size="lg"
                  className="w-full font-bold"
                  onPress={onProceedToPayment}
                >
                  Procesar Venta
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
