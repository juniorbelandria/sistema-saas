'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { ShoppingCart, DollarSign, Wallet, AlertTriangle, Clock, TrendingUp, Package } from 'lucide-react';

export default function DashboardPage() {
  // TODO: Obtener datos reales de Supabase
  const kpis = [
    { label: 'Ventas Hoy', value: '24', icon: ShoppingCart, color: 'primary' },
    { label: 'Ingresos Hoy', value: '$1,250.00', icon: DollarSign, color: 'success' },
    { label: 'Caja Actual', value: '$3,450.00', icon: Wallet, color: 'warning' },
    { label: 'Stock Bajo', value: '5', icon: AlertTriangle, color: 'danger' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Plan */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardBody className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-foreground">Plan de Prueba Gratis</p>
              <p className="text-xs text-foreground/60">Te quedan 7 días. Activa tu plan para continuar sin interrupciones.</p>
            </div>
            <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90">
              Activar Plan
            </button>
          </div>
        </CardBody>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border-none shadow-sm">
              <CardBody className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-lg bg-${kpi.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${kpi.color}`} />
                  </div>
                  <Chip size="sm" color={kpi.color} variant="flat">
                    <TrendingUp className="w-3 h-3" />
                  </Chip>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-foreground/60">{kpi.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger" />
              <h3 className="text-sm font-bold">Productos con Stock Bajo</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-content2">
                <div>
                  <p className="text-sm font-semibold">Coca Cola 2L</p>
                  <p className="text-xs text-foreground/60">Stock: 3 unidades</p>
                </div>
                <Chip size="sm" color="danger" variant="flat">Bajo</Chip>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-content2">
                <div>
                  <p className="text-sm font-semibold">Pan Blanco</p>
                  <p className="text-xs text-foreground/60">Stock: 5 unidades</p>
                </div>
                <Chip size="sm" color="danger" variant="flat">Bajo</Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="text-sm font-bold">Fiados Vencidos</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-content2">
                <div>
                  <p className="text-sm font-semibold">Juan Pérez</p>
                  <p className="text-xs text-foreground/60">Vencido hace 3 días</p>
                </div>
                <p className="text-sm font-bold text-danger">$45.00</p>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-content2">
                <div>
                  <p className="text-sm font-semibold">María García</p>
                  <p className="text-xs text-foreground/60">Vencido hace 1 día</p>
                </div>
                <p className="text-sm font-bold text-danger">$28.50</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Gráfico de Ventas - Placeholder */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold">Ventas de la Semana</h3>
        </CardHeader>
        <CardBody>
          <div className="h-64 flex items-center justify-center bg-content2 rounded-lg">
            <p className="text-sm text-foreground/60">Gráfico de ventas (Recharts)</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
