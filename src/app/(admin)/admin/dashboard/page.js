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
    <div className="space-y-3 md:space-y-4 max-w-[1400px] mx-auto">
      {/* Banner de Plan */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
        <CardBody className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-3">
            <div>
              <p className="text-xs md:text-sm font-bold text-foreground">Plan de Prueba Gratis</p>
              <p className="text-[10px] md:text-xs text-foreground/60">Te quedan 7 días. Activa tu plan para continuar sin interrupciones.</p>
            </div>
            <button className="w-full sm:w-auto px-3 md:px-4 py-1.5 md:py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
              Activar Plan
            </button>
          </div>
        </CardBody>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="border border-divider/50 shadow-sm hover:shadow transition-all">
              <CardBody className="p-3 md:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-${kpi.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 md:w-5 md:h-5 text-${kpi.color}`} />
                  </div>
                  <div className="flex items-center gap-0.5 text-success">
                    <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    <span className="text-[10px] md:text-xs font-semibold">{kpi.trend}</span>
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground mb-0.5">{kpi.value}</p>
                <p className="text-[10px] md:text-xs text-foreground/60">{kpi.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        <Card className="border border-divider/50 shadow-sm">
          <CardHeader className="pb-2 px-3 md:px-4 pt-3 md:pt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 text-danger" />
              </div>
              <h3 className="text-xs md:text-sm font-bold">Productos con Stock Bajo</h3>
            </div>
          </CardHeader>
          <CardBody className="px-3 md:px-4 pb-3 md:pb-4">
            <div className="space-y-1.5">
              {[
                { nombre: 'Coca Cola 2L', stock: 3 },
                { nombre: 'Pan Blanco', stock: 5 },
                { nombre: 'Leche Entera', stock: 2 }
              ].map((producto, i) => (
                <div key={i} className="flex items-center justify-between p-2 md:p-2.5 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
                  <div>
                    <p className="text-xs md:text-sm font-semibold">{producto.nombre}</p>
                    <p className="text-[10px] md:text-xs text-foreground/60">Stock: {producto.stock} unidades</p>
                  </div>
                  <Chip size="sm" color="danger" variant="flat" className="text-[10px]">Bajo</Chip>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider/50 shadow-sm">
          <CardHeader className="pb-2 px-3 md:px-4 pt-3 md:pt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-warning" />
              </div>
              <h3 className="text-xs md:text-sm font-bold">Fiados Vencidos</h3>
            </div>
          </CardHeader>
          <CardBody className="px-3 md:px-4 pb-3 md:pb-4">
            <div className="space-y-1.5">
              {[
                { nombre: 'Juan Pérez', dias: 3, monto: '$45.00' },
                { nombre: 'María García', dias: 1, monto: '$28.50' },
                { nombre: 'Carlos López', dias: 5, monto: '$62.00' }
              ].map((fiado, i) => (
                <div key={i} className="flex items-center justify-between p-2 md:p-2.5 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
                  <div>
                    <p className="text-xs md:text-sm font-semibold">{fiado.nombre}</p>
                    <p className="text-[10px] md:text-xs text-foreground/60">Vencido hace {fiado.dias} días</p>
                  </div>
                  <p className="text-xs md:text-sm font-bold text-danger">{fiado.monto}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Gráfico de Ventas */}
      <Card className="border border-divider/50 shadow-sm">
        <CardHeader className="px-3 md:px-4 pt-3 md:pt-4">
          <div className="flex items-center justify-between w-full">
            <h3 className="text-xs md:text-sm font-bold">Ventas de la Semana</h3>
            <Chip size="sm" variant="flat" color="primary" className="text-[10px]">
              <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
              +15%
            </Chip>
          </div>
        </CardHeader>
        <CardBody className="px-3 md:px-4 pb-3 md:pb-4">
          <div className="h-40 md:h-56 lg:h-64 flex items-center justify-center bg-default-50 rounded-lg">
            <p className="text-xs md:text-sm text-foreground/60">Gráfico de ventas (Recharts)</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
