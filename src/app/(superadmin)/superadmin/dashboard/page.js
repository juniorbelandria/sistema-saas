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
                  {kpi.trend !== '0' && (
                    <div className={`flex items-center gap-1 ${kpi.trend.startsWith('+') ? 'text-success bg-success/10' : 'text-danger bg-danger/10'} px-2 py-0.5 rounded-full`}>
                      <ArrowUpRight className="w-3 h-3" />
                      <span className="text-xs font-bold">{kpi.trend}</span>
                    </div>
                  )}
                </div>
                <p className="text-xl md:text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
                <p className="text-xs md:text-sm text-foreground/60 font-medium">{kpi.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Tabla de Negocios Recientes */}
      <Card className="shadow-md border-none">
        <CardHeader className="px-4 md:px-5 pt-4 md:pt-5">
          <h3 className="text-sm md:text-base font-bold">Negocios Registrados Recientemente</h3>
        </CardHeader>
        <CardBody className="px-0 lg:px-5 pb-4 md:pb-5">
          {/* Vista móvil - Cards */}
          <div className="lg:hidden space-y-2 px-4">
            {negociosRecientes.map((negocio) => (
              <Card key={negocio.id} className="shadow-sm border-none bg-content2">
                <CardBody className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{negocio.nombre}</p>
                      <p className="text-xs text-foreground/60">{negocio.tipo}</p>
                    </div>
                    <Chip size="sm" variant="flat">{negocio.pais}</Chip>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-foreground/60 capitalize">{negocio.plan.replace('_', ' ')}</p>
                    <Chip size="sm" color={getEstadoColor(negocio.estado)} variant="flat">
                      {negocio.estado.replace('_', ' ')}
                    </Chip>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Vista desktop - Tabla */}
          <div className="hidden lg:block">
            <Table aria-label="Negocios recientes">
              <TableHeader>
                <TableColumn>NEGOCIO</TableColumn>
                <TableColumn>PAÍS</TableColumn>
                <TableColumn>TIPO</TableColumn>
                <TableColumn>PLAN</TableColumn>
                <TableColumn>ESTADO</TableColumn>
              </TableHeader>
              <TableBody>
                {negociosRecientes.map((negocio) => (
                  <TableRow key={negocio.id}>
                    <TableCell>
                      <p className="text-sm font-semibold">{negocio.nombre}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" variant="flat">{negocio.pais}</Chip>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{negocio.tipo}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm capitalize">{negocio.plan.replace('_', ' ')}</p>
                    </TableCell>
                    <TableCell>
                      <Chip size="sm" color={getEstadoColor(negocio.estado)} variant="flat">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
        <Card className="shadow-md border-none">
          <CardHeader className="pb-3 px-4 md:px-5 pt-4 md:pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-danger/20 to-danger/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-danger" />
              </div>
              <h3 className="text-sm md:text-base font-bold">Negocios Vencidos</h3>
            </div>
          </CardHeader>
          <CardBody className="px-4 md:px-5 pb-4 md:pb-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-content2 hover:shadow-sm transition-all">
                <div>
                  <p className="text-sm font-semibold">Panadería La Espiga</p>
                  <p className="text-xs text-foreground/60">Vencido hace 5 días</p>
                </div>
                <Chip size="sm" color="danger" variant="flat">Vencido</Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="shadow-md border-none">
          <CardHeader className="pb-3 px-4 md:px-5 pt-4 md:pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-sm md:text-base font-bold">Vencen Esta Semana</h3>
            </div>
          </CardHeader>
          <CardBody className="px-4 md:px-5 pb-4 md:pb-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-xl bg-content2 hover:shadow-sm transition-all">
                <div>
                  <p className="text-sm font-semibold">Ferretería El Martillo</p>
                  <p className="text-xs text-foreground/60">Vence en 3 días</p>
                </div>
                <Chip size="sm" color="warning" variant="flat">Próximo</Chip>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
