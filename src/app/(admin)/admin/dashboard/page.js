'use client';

import { Card, CardBody, CardHeader, Chip } from '@heroui/react';
import { ShoppingCart, DollarSign, Wallet, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';

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
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 border-none shadow-md">
        <CardBody className="p-4 md:p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm md:text-base font-bold text-foreground">Plan de Prueba Gratis</p>
              <p className="text-xs md:text-sm text-foreground/60">Te quedan 7 días. Activa tu plan para continuar sin interrupciones.</p>
            </div>
            <button className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 shadow-md shadow-primary/30 transition-all">
              Activar Plan
            </button>
          </div>
        </CardBody>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="bg-gradient-to-br from-content1 to-content2 shadow-md hover:shadow-lg transition-all border-none">
              <CardBody className="p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-${kpi.color}/20 to-${kpi.color}/10 flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${kpi.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-success bg-success/10 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    <span className="text-xs font-bold">{kpi.trend}</span>
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
                <p className="text-xs md:text-sm text-foreground/60 font-medium">{kpi.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card className="shadow-md border-none">
          <CardHeader className="pb-3 px-4 md:px-5 pt-4 md:pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-danger/20 to-danger/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <h3 className="text-sm md:text-base font-bold">Productos con Stock Bajo</h3>
            </div>
          </CardHeader>
          <CardBody className="px-4 md:px-5 pb-4 md:pb-5">
            <div className="space-y-2">
              {[
                { nombre: 'Coca Cola 2L', stock: 3 },
                { nombre: 'Pan Blanco', stock: 5 },
                { nombre: 'Leche Entera', stock: 2 }
              ].map((producto, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-content2 hover:shadow-sm transition-all">
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

        <Card className="shadow-md border-none">
          <CardHeader className="pb-3 px-4 md:px-5 pt-4 md:pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-sm md:text-base font-bold">Fiados Vencidos</h3>
            </div>
          </CardHeader>
          <CardBody className="px-4 md:px-5 pb-4 md:pb-5">
            <div className="space-y-2">
              {[
                { nombre: 'Juan Pérez', dias: 3, monto: '$45.00' },
                { nombre: 'María García', dias: 1, monto: '$28.50' },
                { nombre: 'Carlos López', dias: 5, monto: '$62.00' }
              ].map((fiado, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-content2 hover:shadow-sm transition-all">
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
    </div>
  );
}
