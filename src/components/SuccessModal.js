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

  const handleWhatsApp = () => {
    // Formatear lista de productos
    const productosTexto = items.map(item => 
      `- ${item.cantidad} x ${item.producto.nombre} - ${monedaActual?.simbolo}${(item.producto.precio * item.cantidad).toFixed(2)}`
    ).join('%0A');

    // Construir mensaje formateado
    const mensaje = [
      `*Detalle de Venta #${numeroVenta}*`,
      `---------------------------`,
      ``,
      `*Productos:*`,
      productosTexto,
      ``,
      `---------------------------`,
      `*Subtotal:* ${monedaActual?.simbolo}${subtotal.toFixed(2)}`,
      `*${monedaActual?.impuesto || 'IVA'}:* ${monedaActual?.simbolo}${iva.toFixed(2)}`,
      `*TOTAL:* ${monedaActual?.simbolo}${total.toFixed(2)}`,
      ``,
      `---------------------------`,
      `*Método:* ${payment.method.replace('_', ' ').toUpperCase()}`,
      `*Recibido:* ${monedaActual?.simbolo}${payment.amountReceived.toFixed(2)}`,
      payment.change > 0 ? `*Cambio:* ${monedaActual?.simbolo}${payment.change.toFixed(2)}` : '',
      ``,
      `*¡Gracias por su compra!* 🙏`
    ].filter(line => line !== '').join('%0A');

    window.open(`https://wa.me/?text=${mensaje}`, '_blank');
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
      classNames={{
        base: "w-full mx-4 sm:mx-0 sm:max-w-[500px]",
        backdrop: "bg-black/80"
      }}
    >
      <ModalContent className="bg-content1">
        {() => (
          <>
            <ModalHeader className="flex flex-col items-center gap-3 pt-8 pb-4">
              {/* Icono Animado */}
              <div className={`
                transition-all duration-500 ease-out
                ${showCheck ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
              `}>
                <div className="relative">
                  <div className="absolute inset-0 bg-success/20 rounded-full animate-ping" />
                  <div className="relative bg-success rounded-full p-4">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h2 className="text-2xl font-bold text-success">¡Venta Exitosa!</h2>
                <p className="text-sm text-foreground/60 mt-1">
                  Venta #{numeroVenta} procesada correctamente
                </p>
              </div>
            </ModalHeader>

            <ModalBody className="px-6 py-4">
              {/* Ticket Digital */}
              <Card shadow="none" className="bg-content2 border border-divider">
                <CardBody className="p-4 space-y-3">
                  {/* Info de Venta */}
                  <div className="text-center space-y-1">
                    <p className="text-xs text-foreground/60">{fecha}</p>
                    <p className="text-sm font-semibold">
                      {cliente?.nombre || 'Cliente General'}
                    </p>
                    {cliente?.email && (
                      <p className="text-xs text-foreground/60">{cliente.email}</p>
                    )}
                  </div>

                  <Divider />

                  {/* Lista de Productos */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{item.producto.nombre}</p>
                          <p className="text-xs text-foreground/60">
                            {monedaActual?.simbolo}{item.producto.precio.toFixed(2)} × {item.cantidad}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {monedaActual?.simbolo}{(item.producto.precio * item.cantidad).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Divider />

                  {/* Totales */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">Subtotal:</span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/70">
                        {monedaActual?.impuesto || 'IVA'}:
                      </span>
                      <span className="font-semibold">
                        {monedaActual?.simbolo}{iva.toFixed(2)}
                      </span>
                    </div>
                    <Divider />
                    <div className="flex justify-between">
                      <span className="text-lg font-bold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {monedaActual?.simbolo}{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Divider />

                  {/* Info de Pago */}
                  <div className="space-y-1 text-sm">
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
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button
                  color="secondary"
                  variant="flat"
                  startContent={<Printer className="w-4 h-4" />}
                  onPress={() => handlePrint('nota')}
                  className="font-semibold w-full sm:flex-1"
                >
                  Nota
                </Button>
                <Button
                  color="primary"
                  variant="flat"
                  startContent={<Receipt className="w-4 h-4" />}
                  onPress={() => handlePrint('ticket')}
                  className="font-semibold w-full sm:flex-1"
                >
                  Ticket
                </Button>
                <Button
                  color="success"
                  variant="flat"
                  startContent={<MessageCircle className="w-4 h-4" />}
                  onPress={handleWhatsApp}
                  className="font-semibold w-full sm:flex-1"
                >
                  WhatsApp
                </Button>
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-divider pt-4">
              <Button
                color="primary"
                size="lg"
                className="w-full font-bold"
                onPress={onNewSale}
                startContent={<RefreshCw className="w-5 h-5" />}
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
