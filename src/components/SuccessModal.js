'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Divider
} from '@heroui/react';
import { CheckCircle2, Printer, Receipt, MessageCircle, RefreshCw } from 'lucide-react';

export default function SuccessModal({
  isOpen,
  onClose,
  saleData,
  onNewSale
}) {
  const [showCheck, setShowCheck] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowCheck(false);
      setTimeout(() => setShowCheck(true), 100);
    }
  }, [isOpen]);

  if (!saleData) return null;

  const { 
    items, 
    subtotal, 
    iva, 
    total, 
    payment, 
    monedaActual, 
    cliente,
    fecha,
    numeroVenta
  } = saleData;

  // Función mejorada para generar el link de WhatsApp
  const handleWhatsApp = () => {
    // Construir mensaje usando template literal con saltos de línea reales
    const productosLista = items.map(item => 
      `${item.cantidad} x ${item.producto.nombre} - ${monedaActual?.simbolo}${(item.producto.precio * item.cantidad).toFixed(2)}`
    ).join('\n');

    // Mensaje completo con saltos de línea reales
    const mensaje = `*🛍️ Venta #${numeroVenta}*
------------------------

*PRODUCTOS:*
${productosLista}

------------------------
*SUBTOTAL:* ${monedaActual?.simbolo}${subtotal.toFixed(2)}
*${monedaActual?.impuesto || 'IVA'}:* ${monedaActual?.simbolo}${iva.toFixed(2)}
*TOTAL:* ${monedaActual?.simbolo}${total.toFixed(2)}

------------------------
*PAGO:* ${payment.method.replace('_', ' ').toUpperCase()}
*RECIBIDO:* ${monedaActual?.simbolo}${payment.amountReceived.toFixed(2)}${payment.change > 0 ? `\n*CAMBIO:* ${monedaActual?.simbolo}${payment.change.toFixed(2)}` : ''}

📅 ${fecha}
👤 ${cliente?.nombre || 'Cliente General'}

¡Gracias por su compra! 🙏`;

    // Usar encodeURIComponent para codificar correctamente
    window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  const handlePrint = (type) => {
    console.log(`Imprimiendo ${type}...`, saleData);
    alert(`Función de impresión de ${type} en desarrollo`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      placement="center"
      backdrop="blur"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        base: "w-full mx-2 max-w-[340px] sm:max-w-[360px]",
        backdrop: "bg-black/80"
      }}
    >
      <ModalContent className="bg-content1">
        {() => (
          <>
            <ModalHeader className="flex flex-col items-center gap-2 pt-4 pb-2">
              {/* Icono Animado */}
              <div className={`
                transition-all duration-500 ease-out
                ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
              `}>
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                  <div className="relative bg-success rounded-full p-2">
                    <CheckCircle2 className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-base font-bold text-success">¡Venta Exitosa!</h2>
                <p className="text-[9px] text-foreground/60 mt-0.5">
                  Venta #{numeroVenta}
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="px-3 py-2">
              {/* Ticket Digital */}
              <Card shadow="none" className="bg-neutral-900 dark:bg-neutral-900 border border-divider">
                <CardBody className="p-2.5 space-y-1.5">
                  {/* Info de Venta */}
                  <div className="text-center space-y-0.5">
                    <p className="text-[9px] text-foreground/60">{fecha}</p>
                    <p className="text-[10px] font-semibold">
                      {cliente?.nombre || 'Cliente General'}
                    </p>
                    {cliente?.email && (
                      <p className="text-[9px] text-foreground/60">{cliente.email}</p>
                    )}
                  </div>

                  <Divider className="my-1" />

                  {/* Lista de Productos - Ultra compacta */}
                  <div className="space-y-0.5 max-h-32 overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-[11px] gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.producto.nombre}</p>
                          <p className="text-[9px] text-foreground/60">
                            {monedaActual?.simbolo}{item.producto.precio.toFixed(2)} × {item.cantidad}
                          </p>
                        </div>
                        <p className="font-semibold whitespace-nowrap">
                          {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Divider className="my-1" />

                  {/* Totales - Ultra compactos */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-foreground/70">Subtotal:</span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-foreground/70">
                        {monedaActual?.impuesto || 'IVA'}:
                      </span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{iva.toFixed(2)}
                      </span>
                    </div>
                    <Divider className="my-0.5" />
                    <div className="flex justify-between">
                      <span className="text-xs font-bold">Total:</span>
                      <span className="text-sm font-bold text-primary">
                        {monedaActual?.simbolo}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Divider className="my-1" />

                  {/* Info de Pago - Ultra compacta */}
                  <div className="space-y-0.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Método:</span>
                      <span className="font-semibold capitalize">{payment.method.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Recibido:</span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{payment.amountReceived.toFixed(2)}
                      </span>
                    </div>
                    {payment.change > 0 && (
                      <div className="flex justify-between text-success">
                        <span className="font-semibold">Cambio:</span>
                        <span className="font-bold">
                          {monedaActual?.simbolo}{payment.change.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Botones de Acción Premium - Compactos */}
              <div className="grid grid-cols-3 gap-1.5 mt-2">
                <Button
                  color="secondary"
                  variant="flat"
                  size="sm"
                  startContent={<Printer className="w-3.5 h-3.5" />}
                  onPress={() => handlePrint('nota')}
                  className="font-semibold text-[10px] h-8"
                >
                  Nota
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  startContent={<Receipt className="w-3.5 h-3.5" />}
                  onPress={() => handlePrint('ticket')}
                  className="font-semibold text-[10px] h-8"
                >
                  Ticket
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<MessageCircle className="w-3.5 h-3.5" />}
                  onPress={handleWhatsApp}
                  className="font-semibold text-[10px] h-8"
                >
                  WhatsApp
                </Button>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-divider pt-2 pb-2">
              <Button
                color="primary"
                size="md"
                className="w-full font-bold text-xs h-9"
                onPress={onNewSale}
                startContent={<RefreshCw className="w-4 h-4" />}
              >
                Nueva Venta
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
