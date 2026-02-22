'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PAISES = [
  { codigo: 've', nombre: 'Venezuela', moneda: 'VES', simbolo: 'Bs.', impuesto: 'IVA', tasa: 16 },
  { codigo: 'mx', nombre: 'México', moneda: 'MXN', simbolo: '$', impuesto: 'IVA', tasa: 16 },
  { codigo: 'co', nombre: 'Colombia', moneda: 'COP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'ar', nombre: 'Argentina', moneda: 'ARS', simbolo: '$', impuesto: 'IVA', tasa: 21 },
  { codigo: 'cl', nombre: 'Chile', moneda: 'CLP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'pe', nombre: 'Perú', moneda: 'PEN', simbolo: 'S/', impuesto: 'IGV', tasa: 18 },
  { codigo: 'ec', nombre: 'Ecuador', moneda: 'USD', simbolo: '$', impuesto: 'IVA', tasa: 12 },
  { codigo: 'bo', nombre: 'Bolivia', moneda: 'BOB', simbolo: 'Bs.', impuesto: 'IVA', tasa: 13 },
  { codigo: 'py', nombre: 'Paraguay', moneda: 'PYG', simbolo: '₲', impuesto: 'IVA', tasa: 10 },
  { codigo: 'uy', nombre: 'Uruguay', moneda: 'UYU', simbolo: '$', impuesto: 'IVA', tasa: 22 },
  { codigo: 'br', nombre: 'Brasil', moneda: 'BRL', simbolo: 'R$', impuesto: 'ICMS', tasa: 18 },
  { codigo: 'pa', nombre: 'Panamá', moneda: 'PAB', simbolo: 'B/.', impuesto: 'ITBMS', tasa: 7 },
  { codigo: 'cr', nombre: 'Costa Rica', moneda: 'CRC', simbolo: '₡', impuesto: 'IVA', tasa: 13 },
  { codigo: 'gt', nombre: 'Guatemala', moneda: 'GTQ', simbolo: 'Q', impuesto: 'IVA', tasa: 12 },
  { codigo: 'hn', nombre: 'Honduras', moneda: 'HNL', simbolo: 'L', impuesto: 'ISV', tasa: 15 },
  { codigo: 'sv', nombre: 'El Salvador', moneda: 'USD', simbolo: '$', impuesto: 'IVA', tasa: 13 },
  { codigo: 'ni', nombre: 'Nicaragua', moneda: 'NIO', simbolo: 'C$', impuesto: 'IVA', tasa: 15 },
  { codigo: 'do', nombre: 'Rep. Dominicana', moneda: 'DOP', simbolo: 'RD$', impuesto: 'ITBIS', tasa: 18 },
  { codigo: 'us', nombre: 'Estados Unidos', moneda: 'USD', simbolo: '$', impuesto: 'Sales Tax', tasa: 0 },
  { codigo: 'es', nombre: 'España', moneda: 'EUR', simbolo: '€', impuesto: 'IVA', tasa: 21 },
];

export default function CurrencySelector({ value, onChange }) {
  const monedaActual = PAISES.find(p => p.codigo === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-fit h-8 min-h-8 px-2 bg-default-100 hover:bg-default-200 border-none">
        <SelectValue>
          <span className="text-[11px] font-bold text-foreground">
            {monedaActual?.simbolo} {monedaActual?.moneda}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[220px]">
        {PAISES.map((pais) => (
          <SelectItem key={pais.codigo} value={pais.codigo}>
            <span className="text-xs font-medium text-foreground">
              {pais.simbolo} {pais.moneda} - {pais.nombre}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
