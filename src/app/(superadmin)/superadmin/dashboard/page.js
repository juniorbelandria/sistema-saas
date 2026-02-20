'use client';

import { Card, CardBody, CardHeader, Chip, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { Store, CheckCircle, Clock, AlertCircle, XCircle, Users, Shield } from 'lucide-react';

export default function SuperAdminDashboardPage() {
  // TODO: Obtener datos reales de Supabase
  const kpis = [
    { label: 'Total Negocios', value: '156', icon: Store, color: 'primary' },
    { label: 'Negocios Activos', value: '142', icon: CheckCircle, color: 'success' },
    { label: 'En Prueba Gratis', value: '8', icon: Clock, color: 'warning' },
    { label: 'Vencidos', value: '4', icon: AlertCircle, color: 'danger' },
    { label: 'Suspendidos', value: '2', icon: XCircle, color: 'default' },
    { label: 'Total Usuarios', value: '487', icon: Users, color: 'secondary' },
    { label: 'Super Admins', value: '3', icon: Shield, color: 'primary' },
    { label: 'Vencen esta semana', value: '12', icon: Clock, color: 'warning' },
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
    <div className="space-y-6">
      {/* KPIs Globales */}
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
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-foreground/60">{kpi.label}</p>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Tabla de Negocios Recientes */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-bold">Negocios Registrados Recientemente</h3>
        </CardHeader>
        <CardBody>
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
        </CardBody>
      </Card>

      {/* Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              <h3 className="text-sm font-bold">Negocios Vencidos</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-content2">
                <div>
                  <p className="text-sm font-semibold">Panadería La Espiga</p>
                  <p className="text-xs text-foreground/60">Vencido hace 5 días</p>
                </div>
                <Chip size="sm" color="danger" variant="flat">Vencido</Chip>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              <h3 className="text-sm font-bold">Vencen Esta Semana</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-content2">
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
