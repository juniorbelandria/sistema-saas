'use client';

import { Card, CardBody } from '@heroui/react';
import { CreditCard, Banknote, Smartphone, ArrowLeftRight, Wallet } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote, color: 'success' },
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard, color: 'primary' },
  { id: 'pago_movil', label: 'Pago Móvil', icon: Smartphone, color: 'secondary' },
  { id: 'transferencia', label: 'Transferencia', icon: ArrowLeftRight, color: 'warning' },
  { id: 'mixto', label: 'Mixto', icon: Wallet, color: 'default' },
];

export default function PaymentMethodSelector({ selectedMethod, onSelectMethod }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {PAYMENT_METHODS.map((method) => {
        const Icon = method.icon;
        const isSelected = selectedMethod === method.id;
        
        return (
          <Card
            key={method.id}
            isPressable
            onPress={() => onSelectMethod(method.id)}
            shadow="none"
            className={`
              border-2 transition-all cursor-pointer
              ${isSelected 
                ? `border-${method.color} bg-${method.color}/10 shadow-lg shadow-${method.color}/20` 
                : 'border-divider bg-content2 hover:border-default-400'
              }
            `}
          >
            <CardBody className="p-3 flex flex-col items-center justify-center gap-2">
              <Icon 
                className={`w-6 h-6 ${isSelected ? `text-${method.color}` : 'text-foreground/60'}`} 
              />
              <span className={`text-xs font-semibold text-center ${isSelected ? 'text-foreground' : 'text-foreground/70'}`}>
                {method.label}
              </span>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
