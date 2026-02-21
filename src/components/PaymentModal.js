'use client';

import { useState, useMemo } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Card,
  CardBody,
  Divider
} from '@heroui/react';
import { AlertCircle, CheckCircle2, DollarSign, Check } from 'lucide-react';
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
      size="md"
      placement="center"
      backdrop="blur"
      classNames={{
        base: "w-full mx-4 sm:mx-0 sm:max-w-[500px]",
        backdrop: "bg-black/70"
      }}
    >
      <ModalContent className="bg-content1">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b border-divider">
              <h2 className="text-xl font-bold">Procesar Pago</h2>
              <p className="text-sm text-foreground/60 font-normal">
                Selecciona el método y confirma el monto
              </p>
            </ModalHeader>

            <ModalBody className="py-6 space-y-6">
              {/* Total a Pagar */}
              <Card shadow="none" className="bg-primary/10 border-2 border-primary">
                <CardBody className="p-4">
                  <p className="text-sm text-foreground/70 mb-1">Total a Pagar</p>
                  <p className="text-3xl font-bold text-primary">
                    {monedaActual?.simbolo}{total.toFixed(2)}
                  </p>
                </CardBody>
              </Card>

              {/* Método de Pago */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Método de Pago</h3>
                <PaymentMethodSelector
                  selectedMethod={selectedMethod}
                  onSelectMethod={setSelectedMethod}
                />
              </div>

              <Divider />

              {/* Monto Recibido */}
              <div className="space-y-3">
                <Input
                  type="number"
                  label="Monto Recibido"
                  placeholder="0.00"
                  value={amountReceived}
                  onValueChange={setAmountReceived}
                  variant="bordered"
                  size="lg"
                  color={hasError ? "danger" : "default"}
                  isInvalid={hasError}
                  startContent={
                    <DollarSign className="w-5 h-5 text-default-400" />
                  }
                  classNames={{
                    input: "text-xl font-semibold",
                    label: "text-sm font-semibold"
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
                    <CardBody className="p-3 flex flex-row items-center gap-2">
                      {isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                      )}
                      <span className={`text-sm font-semibold ${isValid ? 'text-success' : 'text-danger'}`}>
                        {message}
                      </span>
                    </CardBody>
                  </Card>
                )}

                {/* Cambio */}
                {isValid && change > 0 && (
                  <Card shadow="none" className="bg-content2">
                    <CardBody className="p-4">
                      <p className="text-sm text-foreground/70 mb-1">Cambio a Entregar</p>
                      <p className="text-2xl font-bold text-success">
                        {monedaActual?.simbolo}{change.toFixed(2)}
                      </p>
                    </CardBody>
                  </Card>
                )}
              </div>
            </ModalBody>

            <ModalFooter className="border-t border-divider flex-col sm:flex-row gap-2">
              <Button
                variant="light"
                onPress={handleClose}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                color="primary"
                size="lg"
                onPress={handleConfirm}
                isDisabled={!isValid}
                className="font-bold w-full sm:w-auto"
                startContent={<Check className="w-5 h-5" />}
              >
                Finalizar Compra
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
