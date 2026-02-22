'use client';

import { useState, useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from '@heroui/react';
import { AlertCircle, CheckCircle2, Check } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';

export default function PaymentModal({
  isOpen,
  onClose,
  total,
  monedaActual,
  onConfirmPayment
}) {
  const [selectedMethod, setSelectedMethod] = useState('efectivo');
  const [amountReceived, setAmountReceived] = useState('');

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

  const handleConfirm = () => {
    if (isValid) {
      onConfirmPayment({
        method: selectedMethod,
        amountReceived: Number(parseFloat(amountReceived).toFixed(2)),
        change: Number(change.toFixed(2))
      });
    }
  };

  const handleClose = () => {
    setSelectedMethod('efectivo');
    setAmountReceived('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="2xl"
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
      classNames={{
        base: "w-full mx-3 max-w-full sm:max-w-[420px] md:max-w-[480px]",
        backdrop: "bg-black/70 z-[60]",
        wrapper: "z-[60]",
        body: "overflow-visible"
      }}
    >
      <ModalContent className="bg-content1">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-divider pb-3 flex-shrink-0">
              <h2 className="text-lg font-bold">Procesar Pago</h2>
              <p className="text-sm text-foreground/60 font-normal">
                Ingresa el monto recibido del cliente
              </p>
            </ModalHeader>

            <ModalBody className="py-4 px-4 sm:px-6 space-y-4">
              {/* Total a Pagar - Diseño horizontal limpio */}
              <div className="flex justify-between items-center p-4 rounded-xl bg-content2 border border-divider">
                <span className="text-sm font-semibold text-foreground/80">Total a Pagar</span>
                <span className="text-2xl font-extrabold text-primary">
                  {monedaActual?.simbolo}{total.toFixed(2)}
                </span>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-foreground/90">Método de Pago</h3>
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                />
              </div>

              {/* Monto Recibido - Input con startContent */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/90 block">
                  Monto Recibido
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountReceived}
                  onValueChange={setAmountReceived}
                  variant="bordered"
                  size="lg"
                  color={hasError ? "danger" : "default"}
                  isInvalid={hasError}
                  autoFocus
                  startContent={
                    <span className="text-xl font-bold text-foreground/60">
                      {monedaActual?.simbolo}
                    </span>
                  }
                  classNames={{
                    input: "text-2xl font-bold text-right pr-4",
                    inputWrapper: "h-14 border-2"
                  }}
                  style={{ fontSize: '16px' }}
                />

                {/* Mensaje de Validación */}
                {amountReceived && (
                  <div 
                    className={`
                      flex items-center gap-2 p-3 rounded-lg border-2
                      ${isValid 
                        ? 'bg-success/10 border-success/30' 
                        : 'bg-danger/10 border-danger/30'
                      }
                    `}
                  >
                    {isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                    )}
                    <span className={`text-sm font-semibold ${isValid ? 'text-success' : 'text-danger'}`}>
                      {message}
                    </span>
                  </div>
                )}

                {/* Cambio - Diseño horizontal limpio */}
                {isValid && change > 0 && (
                  <div className="flex justify-between items-center p-4 rounded-xl bg-success/10 border border-success/30">
                    <span className="text-sm font-semibold text-foreground/80">Cambio a Entregar</span>
                    <span className="text-2xl font-extrabold text-success">
                      {monedaActual?.simbolo}{change.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-divider flex-col sm:flex-row gap-2 pt-3 flex-shrink-0">
              <Button
                variant="flat"
                onPress={handleClose}
                className="w-full sm:w-auto text-sm"
                size="md"
              >
                Cancelar
              </Button>
              <Button
                color={isValid ? "primary" : "default"}
                size="md"
                onPress={handleConfirm}
                isDisabled={!isValid}
                className="font-bold w-full sm:w-auto text-sm shadow-lg"
                startContent={<Check className="w-5 h-5" />}
              >
                Confirmar Pago
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
