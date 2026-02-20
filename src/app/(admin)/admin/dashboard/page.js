'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { ShoppingCart, DollarSign, Wallet, AlertTriangle, Clock, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function DashboardPage() {
  const kpis = [
    { label: 'Ventas Hoy', value: '24', icon: ShoppingCart, color: 'primary', trend: '+12%' },
    { label: 'Ingresos Hoy', value: '$1,250.00', icon: DollarSign, color: 'success', trend: '+8%' },
    { label: 'Caja Actual', value: '$3,450.00', icon: Wallet, color: 'warning', trend: '+5%' },
    { label: 'Stock Bajo', value: '5', icon: AlertTriangle, color: 'danger', trend: '-2' },
  ];

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Banner de Plan */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardBody className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm lg:text-base font-bold text-foreground">Plan de Prueba Gratis</p>
              <p className="text-xs lg:text-sm text-foreground/60">Te quedan 7 días. Activa tu plan para continuar sin interrupciones.</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              Activar Plan
            </button>
          </div>
        </CardBody>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border border-divider shadow-sm hover:shadow-md transition-shadow">
              <CardBody className="p-4 lg:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-${kpi.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 lg:w-6 lg:h-6 text-${kpi.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-success">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-xs font-semibold">{kpi.trend}</span>
                  </div>
                </div>
                <p className="text-2xl lg:text-3xl font-bold text-foreground mb-1">{kpi.value}</p>
                <p className="text-xs lg:text-sm text-foreground/60">{kpi.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <Card className="border border-divider shadow-sm">
          <CardHeader className="pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <h3 className="text-sm lg:text-base font-bold">Productos con Stock Bajo</h3>
            </div>
          </CardHeader>
          <CardBody className="px-4 lg:px-6 pb-4 lg:pb-6">
            <div className="space-y-2">
              {[
                { nombre: 'Coca Cola 2L', stock: 3 },
                { nombre: 'Pan Blanco', stock: 5 },
                { nombre: 'Leche Entera', stock: 2 }
              ].map((producto, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-content2 hover:bg-content3 transition-colors">
                  <div>
                    <p className="text-sm font-semibold">{producto.nombre}</p>
                    <p className="text-xs text-foreground/60">Stock: {producto.stock} unidades</p>
                  </div>
                  <Chip size="sm" color="danger" variant="flat">Bajo</Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider shadow-sm">
          <CardHeader className="pb-2 px-4 lg:px-6 pt-4 lg:pt-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-warning" />
              </div>
              <h3 className="text-sm lg:text-base font-bold">Fiados Vencidos</h3>
            </div>
          </CardHeader>
          <CardBody className="px-4 lg:px-6 pb-4 lg:pb-6">
            <div className="space-y-2">
              {[
                { nombre: 'Juan Pérez', dias: 3, monto: '$45.00' },
                { nombre: 'María García', dias: 1, monto: '$28.50' },
                { nombre: 'Carlos López', dias: 5, monto: '$62.00' }
              ].map((fiado, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-content2 hover:bg-content3 transition-colors">
                  <div>
                    <p className="text-sm font-semibold">{fiado.nombre}</p>
                    <p className="text-xs text-foreground/60">Vencido hace {fiado.dias} días</p>
                  </div>
                  <p className="text-sm font-bold text-danger">{fiado.monto}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Gráfico de Ventas */}
      <Card className="border border-divider shadow-sm">
        <CardHeader className="px-4 lg:px-6 pt-4 lg:pt-6">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-sm lg:text-base font-bold">Ventas de la Semana</h3>
            <Chip size="sm" variant="flat" color="primary">
              <TrendingUp className="w-3 h-3 mr-1" />
              +15%
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="px-4 lg:px-6 pb-4 lg:pb-6">
          <div className="h-48 sm:h-64 lg:h-80 flex items-center justify-center bg-content2 rounded-lg">
            <p className="text-sm text-foreground/60">Gráfico de ventas (Recharts)</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
