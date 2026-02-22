'use client';

import { Card, CardBody } from '@heroui/react';
import { CreditCard, Banknote, Smartphone, ArrowLeftRight, Wallet } from 'lucide-react';

const PAYMENT_METHODS = [
  { id: 'efectivo', label: 'Efectivo', icon: Banknote, colorClass: 'success' },
  { id: 'tarjeta', label: 'Tarjeta', icon: CreditCard, colorClass: 'primary' },
  { id: 'pago_movil', label: 'Pago Móvil', icon: Smartphone, colorClass: 'secondary' },
  { id: 'transferencia', label: 'Transferencia', icon: ArrowLeftRight, colorClass: 'warning' },
  { id: 'mixto', label: 'Mixto', icon: Wallet, colorClass: 'default' },
];

export default function PaymentMethodSelector({ selectedMethod, onSelectMethod }) {
  return (
    <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
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
                ? `border-${method.colorClass} bg-${method.colorClass}/10 shadow-lg` 
                : 'border-divider bg-content2 hover:border-default-400'
              }
            `}
          >
            <CardBody className="p-2 sm:p-3 flex flex-col items-center justify-center gap-1 sm:gap-2">
              <Icon 
                className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-foreground' : 'text-foreground/60'}`} 
              />
              <span className={`text-[10px] sm:text-xs font-semibold text-center leading-tight ${isSelected ? 'text-foreground' : 'text-foreground/70'}`}>
                {method.label}
              </span>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
