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
        base: "w-full mx-2 sm:mx-3 max-w-full sm:max-w-[420px] md:max-w-[480px]",
        backdrop: "bg-black/70 z-[60]",
        wrapper: "z-[60]",
        body: "max-h-[85vh] overflow-y-auto"
      }}
    >
      <ModalContent className="bg-content1">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-0.5 border-b border-divider pb-2 flex-shrink-0">
              <h2 className="text-base sm:text-lg font-bold">Procesar Pago</h2>
              <p className="text-xs sm:text-sm text-foreground/60 font-normal">
                Ingresa el monto recibido
              </p>
            </ModalHeader>

            <ModalBody className="py-3 px-3 sm:px-4 space-y-2 sm:space-y-3">
              {/* Total a Pagar - Diseño horizontal compacto */}
              <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-content2 border border-divider">
                <span className="text-xs sm:text-sm font-semibold text-foreground/80">Total a Pagar</span>
                <span className="text-xl sm:text-2xl font-extrabold text-primary">
                  {monedaActual?.simbolo}{total.toFixed(2)}
                </span>
              </div>

              {/* Método de Pago */}
              <div className="space-y-1.5 sm:space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-foreground/90">Método de Pago</h3>
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                />
              </div>

              {/* Monto Recibido - Input compacto */}
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-bold text-foreground/90 block">
                  Monto Recibido
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amountReceived}
                  onValueChange={setAmountReceived}
                  variant="bordered"
                  size="md"
                  color={hasError ? "danger" : "default"}
                  isInvalid={hasError}
                  autoFocus
                  startContent={
                    <span className="text-lg sm:text-xl font-bold text-foreground/60">
                      {monedaActual?.simbolo}
                    </span>
                  }
                  classNames={{
                    input: "text-xl sm:text-2xl font-bold text-right pr-3 sm:pr-4",
                    inputWrapper: "h-12 sm:h-14 border-2"
                  }}
                  style={{ fontSize: '16px' }}
                />

                {/* Cambio - Diseño horizontal compacto integrado con validación */}
                {amountReceived && (
                  <>
                    {isValid && change > 0 ? (
                      <div className="flex justify-between items-center p-3 sm:p-4 rounded-lg sm:rounded-xl bg-success/10 border border-success/30">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                          <span className="text-xs sm:text-sm font-semibold text-foreground/80">Cambio</span>
                        </div>
                        <span className="text-xl sm:text-2xl font-extrabold text-success">
                          {monedaActual?.simbolo}{change.toFixed(2)}
                        </span>
                      </div>
                    ) : isValid && change === 0 ? (
                      <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-success/10 border border-success/30">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-success">Monto exacto</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 sm:p-2.5 rounded-lg bg-danger/10 border border-danger/30">
                        <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-semibold text-danger">{message}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-divider flex-col-reverse sm:flex-row gap-2 pt-2.5 sm:pt-3 flex-shrink-0">
              <Button
                variant="flat"
                onPress={handleClose}
                className="w-full sm:w-auto text-sm order-2 sm:order-1"
                size="md"
              >
                Cancelar
              </Button>
              <Button
                color={isValid ? "primary" : "default"}
                size="md"
                onPress={handleConfirm}
                isDisabled={!isValid}
                className="font-bold w-full sm:w-auto text-sm shadow-lg order-1 sm:order-2"
                startContent={<Check className="w-4 h-4 sm:w-5 sm:h-5" />}
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
