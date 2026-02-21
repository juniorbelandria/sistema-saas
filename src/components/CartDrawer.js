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
import { Trash2, ShoppingBag, Check, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  carrito, 
  onRemoveItem,
  monedaActual,
  ivaPercentage,
  onIvaChange,
  onConfirmPayment
}) {
  const [selectedMethod, setSelectedMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');

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

  // Calcular cambio con precisión de 2 decimales
  const { change, isValid, message, hasError } = useMemo(() => {
    const received = parseFloat(amountReceived) || 0;
    const totalAmount = Number(total.toFixed(2));
    const diff = Number((received - totalAmount).toFixed(2));

    if (received === 0) {
      return {
        change: 0,
        isValid: false,
        message: 'Ingresa el monto recibido',
        hasError: false
      };
    }

    if (diff < 0) {
      return {
        change: 0,
        isValid: false,
        message: `Faltan ${monedaActual?.simbolo}${Math.abs(diff).toFixed(2)}`,
        hasError: true
      };
    }

    return {
      change: diff,
      isValid: true,
      message: 'Pago válido',
      hasError: false
    };
  }, [amountReceived, total, monedaActual]);

  const itemsCarrito = Object.values(carrito);
  const totalItems = itemsCarrito.reduce((sum, item) => sum + item.cantidad, 0);

  const handleFinalizarCompra = () => {
    if (isValid) {
      onConfirmPayment({
        method: selectedMethod,
        amountReceived: Number(parseFloat(amountReceived).toFixed(2)),
        change: Number(change.toFixed(2))
      });
      // Resetear estado de pago
      setSelectedMethod('efectivo');
      setAmountReceived('');
    }
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
      <DrawerContent className="bg-content1">
        {/* Header Sticky */}
        <DrawerHeader className="flex flex-col gap-1 border-b border-divider sticky top-0 bg-content1 z-10">
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

        {/* Body con scroll */}
        <DrawerBody className="py-3 px-3 sm:py-4 sm:px-4 max-h-[70vh] overflow-y-auto">
          {itemsCarrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingBag className="w-16 h-16 text-default-300 mb-4" />
              <p className="text-sm text-foreground/60">Tu carrito está vacío</p>
              <p className="text-xs text-foreground/40 mt-1">Agrega productos para comenzar</p>
            </div>
          ) : (
            <>
              {/* Lista de Productos */}
              <div className="space-y-1.5 sm:space-y-2 mb-3">
                {itemsCarrito.map((item) => (
                  <Card 
                    key={item.producto.id}
                    shadow="none"
                    className="bg-content2 border border-divider"
                  >
                    <CardBody className="p-2 sm:p-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[10px] sm:text-xs font-semibold truncate">
                            {item.producto.nombre}
                          </h3>
                          <p className="text-[9px] sm:text-[10px] text-foreground/60 mt-0.5">
                            {monedaActual?.simbolo}{item.producto.precio.toFixed(2)} × {item.cantidad}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-[10px] sm:text-xs font-bold text-primary whitespace-nowrap">
                            {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                          </p>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => onRemoveItem(item.producto.id)}
                            className="min-w-5 w-5 h-5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>

              <Divider className="my-3" />

              {/* IVA Input */}
              <div className="space-y-2 mb-3">
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
                    input: "text-[10px] sm:text-xs",
                    label: "text-[9px] sm:text-[10px] font-semibold"
                  }}
                />

                {/* Resumen de Totales */}
                <Card shadow="none" className="bg-content2">
                  <CardBody className="p-2 sm:p-2.5 space-y-1">
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-foreground/70">Subtotal:</span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[10px] sm:text-xs">
                      <span className="text-foreground/70">
                        {monedaActual?.impuesto || 'IVA'} ({ivaPercentage}%):
                      </span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{iva.toFixed(2)}
                      </span>
                    </div>
                    <Divider className="my-1" />
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base font-bold">Total:</span>
                      <span className="text-lg sm:text-xl font-bold text-primary">
                        {monedaActual?.simbolo}{total.toFixed(2)}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </div>

              <Divider className="my-3" />

              {/* Sección de Pago Integrada */}
              <div className="space-y-3">
                <h3 className="text-xs sm:text-sm font-bold">Método de Pago</h3>
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                />

                <Input
                  type="number"
                  label="Monto Recibido"
                  placeholder="0.00"
                  value={amountReceived}
                  onValueChange={setAmountReceived}
                  variant="bordered"
                  size="sm"
                  color={hasError ? "danger" : "default"}
                  isInvalid={hasError}
                  startContent={
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-default-400" />
                  }
                  classNames={{
                    input: "text-sm sm:text-base font-semibold",
                    label: "text-[10px] sm:text-xs font-semibold"
                  }}
                />

                {/* Mensaje de Validación */}
                {amountReceived && (
                  <Card 
                    shadow="none" 
                    className={`
                      ${isValid 
                        ? 'bg-success/10 border-success' 
                        : 'bg-danger/10 border-danger'
                      } border-2
                    `}
                  >
                    <CardBody className="p-2 flex flex-row items-center gap-2">
                      {isValid ? (
                        <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-danger flex-shrink-0" />
                      )}
                      <span className={`text-[10px] sm:text-xs font-semibold ${isValid ? 'text-success' : 'text-danger'}`}>
                        {message}
                      </span>
                    </CardBody>
                  </Card>
                )}

                {/* Cambio */}
                {isValid && change > 0 && (
                  <Card shadow="none" className="bg-content2">
                    <CardBody className="p-2 sm:p-2.5">
                      <p className="text-[10px] sm:text-xs text-foreground/70 mb-0.5">Cambio a Entregar</p>
                      <p className="text-base sm:text-lg font-bold text-success">
                        {monedaActual?.simbolo}{change.toFixed(2)}
                      </p>
                    </CardBody>
                  </Card>
                )}
              </div>
            </>
          )}
        </DrawerBody>

        {/* Footer Sticky */}
        {itemsCarrito.length > 0 && (
          <DrawerFooter className="border-t border-divider pt-3 sticky bottom-0 bg-content1">
            <Button
              color={isValid ? "primary" : "default"}
              size="lg"
              className="w-full font-bold text-xs sm:text-sm"
              onPress={handleFinalizarCompra}
              isDisabled={!isValid}
              startContent={<Check className="w-4 h-4 sm:w-5 sm:h-5" />}
            >
              Finalizar Compra
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}
