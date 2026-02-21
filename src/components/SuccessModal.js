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
    // Generar lista de productos iterando sobre el carrito
    const productosLista = items.map(item => 
      `${item.cantidad} x ${item.producto.nombre} - ${monedaActual?.simbolo}${(item.producto.precio * item.cantidad).toFixed(2)}`
    ).join('%0A');

    // Construir mensaje completo con formato profesional
    const mensajeCompleto = [
      `*🛍️ Venta #${numeroVenta}*`,
      `------------------------`,
      ``,
      `*PRODUCTOS:*`,
      productosLista,
      ``,
      `------------------------`,
      `*SUBTOTAL:* ${monedaActual?.simbolo}${subtotal.toFixed(2)}`,
      `*${monedaActual?.impuesto || 'IVA'}:* ${monedaActual?.simbolo}${iva.toFixed(2)}`,
      `*TOTAL:* ${monedaActual?.simbolo}${total.toFixed(2)}`,
      ``,
      `------------------------`,
      `*PAGO:* ${payment.method.replace('_', ' ').toUpperCase()}`,
      `*RECIBIDO:* ${monedaActual?.simbolo}${payment.amountReceived.toFixed(2)}`,
      payment.change > 0 ? `*CAMBIO:* ${monedaActual?.simbolo}${payment.change.toFixed(2)}` : '',
      ``,
      `📅 ${fecha}`,
      `👤 ${cliente?.nombre || 'Cliente General'}`,
      ``,
      `¡Gracias por su compra! 🙏`
    ].filter(line => line !== '').join('%0A');

    // Usar encodeURIComponent para asegurar formato correcto
    const mensajeCodificado = encodeURIComponent(mensajeCompleto);
    window.open(`https://wa.me/?text=${mensajeCodificado}`, '_blank');
  };

  const handlePrint = (type) => {
    console.log(`Imprimiendo ${type}...`, saleData);
    alert(`Función de impresión de ${type} en desarrollo`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      placement="center"
      backdrop="blur"
      hideCloseButton
      scrollBehavior="inside"
      classNames={{
        base: "w-full mx-3 sm:mx-0 sm:max-w-[420px]",
        backdrop: "bg-black/80"
      }}
    >
      <ModalContent className="bg-content1">
        {() => (
          <>
            <ModalHeader className="flex flex-col items-center gap-2 sm:gap-3 pt-6 sm:pt-8 pb-3 sm:pb-4">
              {/* Icono Animado */}
              <div className={`
                transition-all duration-500 ease-out
                ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
              `}>
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                  <div className="relative bg-success rounded-full p-3 sm:p-4">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-success">¡Venta Exitosa!</h2>
                <p className="text-xs sm:text-sm text-foreground/60 mt-1">
                  Venta #{numeroVenta} procesada correctamente
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="px-4 sm:px-6 py-3 sm:py-4">
              {/* Ticket Digital */}
              <Card shadow="none" className="bg-content2 border border-divider">
                <CardBody className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  {/* Info de Venta */}
                  <div className="text-center space-y-0.5 sm:space-y-1">
                    <p className="text-[10px] sm:text-xs text-foreground/60">{fecha}</p>
                    <p className="text-xs sm:text-sm font-semibold">
                      {cliente?.nombre || 'Cliente General'}
                    </p>
                    {cliente?.email && (
                      <p className="text-[10px] sm:text-xs text-foreground/60">{cliente.email}</p>
                    )}
                  </div>

                  <Divider />

                  {/* Lista de Productos */}
                  <div className="space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs sm:text-sm gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.producto.nombre}</p>
                          <p className="text-[10px] sm:text-xs text-foreground/60">
                            {monedaActual?.simbolo}{item.producto.precio.toFixed(2)} × {item.cantidad}
                          </p>
                        </div>
                        <p className="font-semibold whitespace-nowrap">
                          {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Divider />

                  {/* Totales */}
                  <div className="space-y-1 sm:space-y-1.5">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-foreground/70">Subtotal:</span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-foreground/70">
                        {monedaActual?.impuesto || 'IVA'}:
                      </span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{iva.toFixed(2)}
                      </span>
                    </div>
                    <Divider />
                    <div className="flex justify-between">
                      <span className="text-sm sm:text-base font-bold">Total:</span>
                      <span className="text-base sm:text-lg font-bold text-primary">
                        {monedaActual?.simbolo}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Divider />

                  {/* Info de Pago */}
                  <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
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

              {/* Botones de Acción Premium - Responsivos */}
              <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                <Button
                  color="secondary"
                  variant="flat"
                  size="sm"
                  startContent={<Printer className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  onPress={() => handlePrint('nota')}
                  className="font-semibold w-full sm:flex-1 text-xs sm:text-sm"
                >
                  Nota
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  size="sm"
                  startContent={<Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  onPress={() => handlePrint('ticket')}
                  className="font-semibold w-full sm:flex-1 text-xs sm:text-sm"
                >
                  Ticket
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  startContent={<MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  onPress={handleWhatsApp}
                  className="font-semibold w-full sm:flex-1 text-xs sm:text-sm"
                >
                  WhatsApp
                </Button>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-divider pt-3">
              <Button
                color="primary"
                size="lg"
                className="w-full font-bold text-xs sm:text-sm"
                onPress={onNewSale}
                startContent={<RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />}
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
