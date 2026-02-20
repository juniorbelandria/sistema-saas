'use client';

import { Card, CardBody, CardHeader, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { Store, CheckCircle, Clock, AlertCircle, XCircle, Users, Shield, ArrowUpRight } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  const kpis = [
    { label: 'Total Negocios', value: '156', icon: Store, color: 'primary', trend: '+12' },
    { label: 'Negocios Activos', value: '142', icon: CheckCircle, color: 'success', trend: '+8' },
    { label: 'En Prueba Gratis', value: '8', icon: Clock, color: 'warning', trend: '-2' },
    { label: 'Vencidos', value: '4', icon: AlertCircle, color: 'danger', trend: '+1' },
    { label: 'Suspendidos', value: '2', icon: XCircle, color: 'default', trend: '0' },
    { label: 'Total Usuarios', value: '487', icon: Users, color: 'secondary', trend: '+23' },
    { label: 'Super Admins', value: '3', icon: Shield, color: 'primary', trend: '0' },
    { label: 'Vencen esta semana', value: '12', icon: Clock, color: 'warning', trend: '+5' },
  ];

  const negociosRecientes = [
    { id: 1, nombre: 'Bodega El Sol', pais: 'VE', tipo: 'Bodega', plan: 'mensual', estado: 'activo' },
    { id: 2, nombre: 'Farmacia Central', pais: 'MX', tipo: 'Farmacia', plan: 'prueba_gratis', estado: 'prueba_gratis' },
    { id: 3, nombre: 'Supermercado Norte', pais: 'CO', tipo: 'Supermercado', plan: 'anual', estado: 'activo' },
    { id: 4, nombre: 'Panadería La Espiga', pais: 'PE', tipo: 'Panadería', plan: 'mensual', estado: 'vencido' },
  ];

  const getEstadoColor = (estado) => {
    const colors = {
      activo: 'success',
      prueba_gratis: 'warning',
      vencido: 'danger',
      suspendido: 'default',
    };
    return colors[estado] || 'default';
  };

  return (
    <div className="space-y-3 md:space-y-4 max-w-[1400px] mx-auto">
      {/* KPIs Globales */}
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
                  {kpi.trend !== '0' && (
                    <div className={`flex items-center gap-0.5 ${kpi.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                      <ArrowUpRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="text-[10px] md:text-xs font-semibold">{kpi.trend}</span>
                    </div>
                  )}
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground mb-0.5">{kpi.value}</p>
                <p className="text-[10px] md:text-xs text-foreground/60">{kpi.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Tabla de Negocios Recientes */}
      <Card className="border border-divider/50 shadow-sm">
        <CardHeader className="px-3 md:px-4 pt-3 md:pt-4">
          <h3 className="text-xs md:text-sm font-bold">Negocios Registrados Recientemente</h3>
        </CardHeader>
        <CardBody className="px-0 lg:px-4 pb-3 md:pb-4">
          {/* Vista móvil - Cards */}
          <div className="lg:hidden space-y-2 px-3">
            {negociosRecientes.map((negocio) => (
              <Card key={negocio.id} className="border border-divider/50 shadow-sm">
                <CardBody className="p-2.5">
                  <div className="flex items-start justify-between mb-1.5">
                    <div>
                      <p className="text-xs font-semibold">{negocio.nombre}</p>
                      <p className="text-[10px] text-foreground/60">{negocio.tipo}</p>
                    </div>
                    <Chip size="sm" variant="flat" className="text-[10px]">{negocio.pais}</Chip>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-foreground/60 capitalize">{negocio.plan.replace('_', ' ')}</p>
                    <Chip size="sm" color={getEstadoColor(negocio.estado)} variant="flat" className="text-[10px]">
                      {negocio.estado.replace('_', ' ')}
                    </Chip>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden lg:block">
            <Table aria-label="Negocios recientes" className="text-xs">
              <TableHeader>
                <TableColumn className="text-[10px]">NEGOCIO</TableColumn>
                <TableColumn className="text-[10px]">PAÍS</TableColumn>
                <TableColumn className="text-[10px]">TIPO</TableColumn>
                <TableColumn className="text-[10px]">PLAN</TableColumn>
                <TableColumn className="text-[10px]">ESTADO</TableColumn>
              </TableHeader>
              <TableBody>
                {negociosRecientes.map((negocio) => (
                  <TableRow key={negocio.id}>
                    <TableCell>
                      <p className="text-xs font-semibold">{negocio.nombre}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat" className="text-[10px]">{negocio.pais}</Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs">{negocio.tipo}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs capitalize">{negocio.plan.replace('_', ' ')}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getEstadoColor(negocio.estado)} variant="flat" className="text-[10px]">
                        {negocio.estado.replace('_', ' ')}
                      </Chip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-3">
        <Card className="border border-divider/50 shadow-sm">
          <CardHeader className="pb-2 px-3 md:px-4 pt-3 md:pt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 text-danger" />
              </div>
              <h3 className="text-xs md:text-sm font-bold">Negocios Vencidos</h3>
            </div>
          </CardHeader>
          <CardBody className="px-3 md:px-4 pb-3 md:pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 md:p-2.5 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
                <div>
                  <p className="text-xs md:text-sm font-semibold">Panadería La Espiga</p>
                  <p className="text-[10px] md:text-xs text-foreground/60">Vencido hace 5 días</p>
                </div>
                <Chip size="sm" color="danger" variant="flat" className="text-[10px]">Vencido</Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="border border-divider/50 shadow-sm">
          <CardHeader className="pb-2 px-3 md:px-4 pt-3 md:pt-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-warning" />
              </div>
              <h3 className="text-xs md:text-sm font-bold">Vencen Esta Semana</h3>
            </div>
          </CardHeader>
          <CardBody className="px-3 md:px-4 pb-3 md:pb-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-2 md:p-2.5 rounded-lg bg-default-50 hover:bg-default-100 transition-colors">
                <div>
                  <p className="text-xs md:text-sm font-semibold">Ferretería El Martillo</p>
                  <p className="text-[10px] md:text-xs text-foreground/60">Vence en 3 días</p>
                </div>
                <Chip size="sm" color="warning" variant="flat" className="text-[10px]">Próximo</Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
