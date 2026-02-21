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
      size="lg"
      placement="center"
      backdrop="blur"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        base: "w-full mx-2 max-w-[360px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[580px] xl:max-w-[640px]",
        backdrop: "bg-black/80"
      }}
    >
      <ModalContent className="bg-content1">
        {() => (
          <>
            <ModalHeader className="flex flex-col items-center gap-2 pt-4 pb-3">
              {/* Icono Animado */}
              <div className={`
                transition-all duration-500 ease-out
                ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
              `}>
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                  <div className="relative bg-success rounded-full p-2 md:p-3">
                    <CheckCircle2 className="w-7 h-7 md:w-9 md:h-9 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-base md:text-lg font-bold text-success">¡Venta Exitosa!</h2>
                <p className="text-[9px] md:text-[10px] text-foreground/60 mt-0.5">
                  Venta #{numeroVenta}
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="px-3 md:px-4 py-2 md:py-3">
              {/* Ticket Digital - Papel blanco en Light, panel oscuro en Dark */}
              <Card shadow="sm" className="bg-content2 border border-divider">
                <CardBody className="p-3 md:p-4 space-y-2 md:space-y-2.5">
                  {/* Info de Venta */}
                  <div className="text-center space-y-0.5">
                    <p className="text-[9px] md:text-[10px] text-foreground/60">{fecha}</p>
                    <p className="text-[10px] md:text-xs font-semibold text-foreground">
                      {cliente?.nombre || 'Cliente General'}
                    </p>
                    {cliente?.email && (
                      <p className="text-[9px] md:text-[10px] text-foreground/60">{cliente.email}</p>
                    )}
                  </div>

                  <Divider className="my-1 md:my-1.5" />

                  {/* Lista de Productos - Ultra compacta */}
                  <div className="space-y-1 md:space-y-1.5 max-h-32 md:max-h-40 overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-[11px] md:text-xs gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-foreground">{item.producto.nombre}</p>
                          <p className="text-[9px] md:text-[10px] text-foreground/60">
                            {monedaActual?.simbolo}{item.producto.precio.toFixed(2)} × {item.cantidad}
                          </p>
                        </div>
                        <p className="font-semibold whitespace-nowrap text-foreground">
                          {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Divider className="my-1 md:my-1.5" />

                  {/* Totales - Ultra compactos */}
                  <div className="space-y-1 md:space-y-1.5">
                    <div className="flex justify-between text-[11px] md:text-xs">
                      <span className="text-foreground/70">Subtotal:</span>
                      <span className="font-semibold text-foreground">
                        {monedaActual?.simbolo}{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] md:text-xs">
                      <span className="text-foreground/70">
                        {monedaActual?.impuesto || 'IVA'}:
                      </span>
                      <span className="font-semibold text-foreground">
                        {monedaActual?.simbolo}{iva.toFixed(2)}
                      </span>
                    </div>
                    <Divider className="my-0.5 md:my-1" />
                    <div className="flex justify-between">
                      <span className="text-xs md:text-sm font-bold text-foreground">Total:</span>
                      <span className="text-sm md:text-base font-bold text-primary">
                        {monedaActual?.simbolo}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Divider className="my-1 md:my-1.5" />

                  {/* Info de Pago - Ultra compacta */}
                  <div className="space-y-1 md:space-y-1.5 text-[11px] md:text-xs">
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Método:</span>
                      <span className="font-semibold capitalize text-foreground">{payment.method.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/70">Recibido:</span>
                      <span className="font-semibold text-foreground">
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
              <div className="grid grid-cols-3 gap-1.5 md:gap-2 mt-2 md:mt-3">
                <Button
                  color="secondary"
                  variant="flat"
                  size="sm"
                  startContent={<Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  onPress={() => handlePrint('nota')}
                  className="font-semibold text-[10px] md:text-xs h-8 md:h-9"
                >
                  Nota
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  startContent={<Receipt className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  onPress={() => handlePrint('ticket')}
                  className="font-semibold text-[10px] md:text-xs h-8 md:h-9"
                >
                  Ticket
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                  onPress={handleWhatsApp}
                  className="font-semibold text-[10px] md:text-xs h-8 md:h-9"
                >
                  WhatsApp
                </Button>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-divider pt-2 md:pt-3 pb-2 md:pb-3">
              <Button
                color="primary"
                size="md"
                className="w-full font-bold text-xs md:text-sm h-9 md:h-10"
                onPress={onNewSale}
                startContent={<RefreshCw className="w-4 h-4 md:w-5 md:h-5" />}
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
