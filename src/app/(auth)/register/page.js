'use client';

import { useState } from 'react';
import { Button, Input, Select, SelectItem, Checkbox, Card, CardBody, Chip, Divider } from '@heroui/react';
import { 
  ArrowRight, ArrowLeft, Check, User, Building2, FileText, 
  Mail, Lock, Phone, MapPin, Globe, DollarSign, FileCheck, CheckCircle2 
} from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from '@/components/ThemeToggle';

const PAISES = [
  { codigo: 'VE', nombre: 'Venezuela 🇻🇪', moneda: 'VES', simbolo: 'Bs.', impuesto: 'IVA', tasa: 16 },
  { codigo: 'MX', nombre: 'México 🇲🇽', moneda: 'MXN', simbolo: '$', impuesto: 'IVA', tasa: 16 },
  { codigo: 'CO', nombre: 'Colombia 🇨🇴', moneda: 'COP', simbolo: '$', impuesto: 'IVA', tasa: 19 },
  { codigo: 'US', nombre: 'Estados Unidos 🇺🇸', moneda: 'USD', simbolo: '$', impuesto: 'Sales Tax', tasa: 0 },
  { codigo: 'PE', nombre: 'Perú 🇵🇪', moneda: 'PEN', simbolo: 'S/', impuesto: 'IGV', tasa: 18 },
  { codigo: 'AR', nombre: 'Argentina 🇦🇷', moneda: 'ARS', simbolo: '$', impuesto: 'IVA', tasa: 21 },
];

const TIPOS_NEGOCIO = [
  'Bodega', 'Supermercado', 'Farmacia', 'Restaurante', 'Cafetería',
  'Ferretería', 'Tienda de Ropa', 'Panadería', 'Librería', 'Otro'
];

export default function RegisterPage() {
  const [paso, setPaso] = useState(1);
  const [focusedField, setFocusedField] = useState(null);
  const [aceptoTerminos, setAceptoTerminos] = useState(false);

  // Paso 1: Datos del propietario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [emailPropietario, setEmailPropietario] = useState('');
  const [telefonoPropietario, setTelefonoPropietario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // Paso 2: Datos del negocio
  const [nombreNegocio, setNombreNegocio] = useState('');
  const [nombreLegal, setNombreLegal] = useState('');
  const [paisSeleccionado, setPaisSeleccionado] = useState('');
  const [tipoNegocio, setTipoNegocio] = useState('');
  const [telefonoNegocio, setTelefonoNegocio] = useState('');
  const [direccionNegocio, setDireccionNegocio] = useState('');

  // Paso 3: Configuración fiscal
  const [rifNit, setRifNit] = useState('');
  const [tasaImpuesto, setTasaImpuesto] = useState('');

  const paisConfig = PAISES.find(p => p.codigo === paisSeleccionado);
  const progreso = (paso / 4) * 100;

  const validarPaso1 = () => {
    return nombreCompleto && emailPropietario && password && 
           confirmarPassword && password === confirmarPassword;
  };

  const validarPaso2 = () => {
    return nombreNegocio && nombreLegal && paisSeleccionado && tipoNegocio;
  };

  const validarPaso3 = () => {
    return true; // Campos fiscales opcionales
  };

  const handleSiguiente = () => {
    if (paso === 1 && !validarPaso1()) return;
    if (paso === 2 && !validarPaso2()) return;
    if (paso === 3 && !validarPaso3()) return;
    setPaso(paso + 1);
  };

  const handleAnterior = () => {
    setPaso(paso - 1);
  };

  const handleRegistro = () => {
    console.log('Registrando negocio...');
  };

  return (
    <div className="flex min-h-screen bg-background relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Columna Izquierda - Branding */}
      <div className="hidden xl:flex xl:w-1/2 bg-content2 p-6 xl:p-8 flex-col justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        
        <div className="relative z-10 max-w-xl mx-auto w-full">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 flex-shrink-0">
                <Image
                  src="/assets/imagenes/logonegro.webp"
                  alt="Sistema POS"
                  width={48}
                  height={48}
                  className="object-contain"
                  priority
                  quality={85}
                />
              </div>
              <h1 className="text-base font-bold text-foreground">Sistema POS</h1>
            </div>
            
            <h2 className="text-2xl xl:text-3xl font-bold text-foreground mb-2">
              Registra tu negocio{' '}
              <span className="text-primary">en minutos</span>
            </h2>
            
            <p className="text-xs text-foreground/70 leading-relaxed">
              Completa el proceso de registro en 4 simples pasos y comienza a gestionar 
              tu negocio con la plataforma más completa del mercado.
            </p>
          </div>

          {/* Pasos del proceso - Stepper mejorado */}
          <div className="space-y-3 mb-6">
            {[
              { num: 1, icon: User, titulo: 'Datos del Propietario', desc: 'Información personal y credenciales de acceso' },
              { num: 2, icon: Building2, titulo: 'Datos del Negocio', desc: 'Información comercial y ubicación' },
              { num: 3, icon: FileText, titulo: 'Configuración Fiscal', desc: 'Datos tributarios y moneda' },
              { num: 4, icon: FileCheck, titulo: 'Confirmación', desc: 'Revisa y confirma tu información' }
            ].map((item) => {
              const Icon = item.icon;
              const isCompleted = paso > item.num;
              const isCurrent = paso === item.num;
              const isPending = paso < item.num;

              return (
                <div key={item.num} className="flex items-start gap-3 group">
                  {/* Línea conectora */}
                  {item.num < 4 && (
                    <div className="absolute left-[20px] mt-12 w-0.5 h-12 bg-gradient-to-b from-primary/40 to-transparent" 
                         style={{ opacity: isCompleted ? 1 : 0.2 }} />
                  )}
                  
                  {/* Círculo con número/check */}
                  <div className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-primary shadow-lg shadow-primary/50' 
                      : isCurrent 
                        ? 'bg-foreground ring-4 ring-primary/20' 
                        : 'bg-default-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <span className={`text-sm font-bold ${isCurrent ? 'text-background' : 'text-foreground/40'}`}>
                        {item.num}
                      </span>
                    )}
                  </div>
                  
                  {/* Contenido */}
                  <div className={`flex-1 transition-all duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-foreground'}`}>
                        {item.titulo}
                      </h3>
                      {isCompleted && (
                        <Chip size="sm" color="success" variant="flat" className="h-5">
                          Completado
                        </Chip>
                      )}
                      {isCurrent && (
                        <Chip size="sm" color="primary" variant="flat" className="h-5">
                          Actual
                        </Chip>
                      )}
                    </div>
                    <p className="text-xs text-foreground/60 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-foreground/10">
            <p className="text-xs text-foreground font-bold leading-relaxed">
              <span className="text-primary text-sm">Aviso:</span> Usuario responsable de obligaciones fiscales. 
              Sistema no certifica ante autoridades tributarias.
            </p>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="flex-1 flex items-center justify-center p-4 xs:p-6 sm:p-8 bg-background">
        <div className="w-full max-w-[90%] xs:max-w-md space-y-6">
          {/* Header Mobile */}
          <div className="xl:hidden flex items-center justify-center gap-3 mb-6">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/assets/imagenes/logonegro.webp"
                alt="Sistema POS"
                width={40}
                height={40}
                className="object-contain"
                priority
                quality={85}
              />
            </div>
            <h1 className="text-base font-bold text-foreground">Sistema POS</h1>
          </div>

          {/* Progress Bar mejorado */}
          <Card className="mb-6 border-none shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Chip color="primary" variant="flat" size="sm">
                    <span className="font-bold">Paso {paso} de 4</span>
                  </Chip>
                  <span className="text-xs text-foreground/60 font-bold">
                    {paso === 1 && 'Datos del Propietario'}
                    {paso === 2 && 'Datos del Negocio'}
                    {paso === 3 && 'Configuración Fiscal'}
                    {paso === 4 && 'Confirmación'}
                  </span>
                </div>
                <span className="text-xs font-bold text-primary">{Math.round(progreso)}%</span>
              </div>
              
              {/* Barra de progreso personalizada */}
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((num) => (
                  <div
                    key={num}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      paso >= num 
                        ? 'bg-primary shadow-sm shadow-primary/50' 
                        : 'bg-default-200'
                    }`}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Título del paso actual */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              {paso === 1 && 'Datos del Propietario'}
              {paso === 2 && 'Datos del Negocio'}
              {paso === 3 && 'Configuración Fiscal'}
              {paso === 4 && 'Confirmación'}
            </h2>
            <p className="text-sm text-foreground/60 font-semibold">
              {paso === 1 && 'Información personal y credenciales'}
              {paso === 2 && 'Información comercial de tu negocio'}
              {paso === 3 && 'Configuración tributaria y moneda'}
              {paso === 4 && 'Revisa y confirma tu registro'}
            </p>
          </div>

          {/* PASO 1: Datos del Propietario */}
          {paso === 1 && (
            <form className="space-y-5">
              <Input
                type="text"
                label={<span className="font-bold">Nombre Completo</span>}
                placeholder="Juan Pérez"
                value={nombreCompleto}
                onValueChange={setNombreCompleto}
                startContent={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              <Input
                type="email"
                label={<span className="font-bold">Correo Electrónico</span>}
                placeholder="tu@email.com"
                value={emailPropietario}
                onValueChange={setEmailPropietario}
                startContent={<Mail className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              <Input
                type="tel"
                label={<span className="font-bold">Teléfono (Opcional)</span>}
                placeholder="+58 412 1234567"
                value={telefonoPropietario}
                onValueChange={setTelefonoPropietario}
                startContent={<Phone className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              <Input
                type="password"
                label={<span className="font-bold">Contraseña</span>}
                placeholder="Mínimo 8 caracteres"
                value={password}
                onValueChange={setPassword}
                startContent={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              <Input
                type="password"
                label={<span className="font-bold">Confirmar Contraseña</span>}
                placeholder="Repite tu contraseña"
                value={confirmarPassword}
                onValueChange={setConfirmarPassword}
                startContent={<Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                isInvalid={confirmarPassword && password !== confirmarPassword}
                errorMessage={confirmarPassword && password !== confirmarPassword ? "Las contraseñas no coinciden" : ""}
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />
            </form>
          )}

          {/* PASO 2: Datos del Negocio */}
          {paso === 2 && (
            <form className="space-y-5">
              <Input
                type="text"
                label={<span className="font-bold">Nombre del Negocio</span>}
                placeholder="Mi Bodega"
                value={nombreNegocio}
                onValueChange={setNombreNegocio}
                startContent={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              <Input
                type="text"
                label={<span className="font-bold">Nombre Legal / Razón Social</span>}
                placeholder="Mi Bodega C.A."
                value={nombreLegal}
                onValueChange={setNombreLegal}
                startContent={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              <Select
                label={<span className="font-bold">País</span>}
                placeholder="Selecciona tu país"
                selectedKeys={paisSeleccionado ? [paisSeleccionado] : []}
                onChange={(e) => setPaisSeleccionado(e.target.value)}
                startContent={<Globe className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-foreground",
                  trigger: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              >
                {PAISES.map((pais) => (
                  <SelectItem key={pais.codigo} value={pais.codigo}>
                    {pais.nombre}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label={<span className="font-bold">Tipo de Negocio</span>}
                placeholder="Selecciona el tipo"
                selectedKeys={tipoNegocio ? [tipoNegocio] : []}
                onChange={(e) => setTipoNegocio(e.target.value)}
                startContent={<Building2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                isRequired
                classNames={{
                  label: "text-foreground",
                  trigger: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              >
                {TIPOS_NEGOCIO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </Select>

              <Input
                type="tel"
                label={<span className="font-bold">Teléfono del Negocio (Opcional)</span>}
                placeholder="+58 212 1234567"
                value={telefonoNegocio}
                onValueChange={setTelefonoNegocio}
                startContent={<Phone className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              <Input
                type="text"
                label={<span className="font-bold">Dirección (Opcional)</span>}
                placeholder="Av. Principal, Local 123"
                value={direccionNegocio}
                onValueChange={setDireccionNegocio}
                startContent={<MapPin className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />
            </form>
          )}

          {/* PASO 3: Configuración Fiscal */}
          {paso === 3 && (
            <form className="space-y-5">
              {paisConfig && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-bold text-foreground">Configuración para {paisConfig.nombre.split(' ')[0]}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div>
                      <p className="text-xs text-foreground/50 mb-1">Moneda</p>
                      <p className="text-sm font-bold text-foreground">{paisConfig.moneda} ({paisConfig.simbolo})</p>
                    </div>
                    <div>
                      <p className="text-xs text-foreground/50 mb-1">Impuesto</p>
                      <p className="text-sm font-bold text-foreground">{paisConfig.impuesto} {paisConfig.tasa}%</p>
                    </div>
                  </div>
                </div>
              )}

              <Input
                type="text"
                label={<span className="font-bold">{paisConfig?.codigo === 'VE' ? 'RIF' : paisConfig?.codigo === 'MX' ? 'RFC' : paisConfig?.codigo === 'CO' ? 'NIT' : 'ID Fiscal (Opcional)'}</span>}
                placeholder={
                  paisConfig?.codigo === 'VE' ? 'J-12345678-9' : 
                  paisConfig?.codigo === 'MX' ? 'ABC123456789' : 
                  paisConfig?.codigo === 'CO' ? '900123456-7' : 
                  'Número de identificación fiscal'
                }
                value={rifNit}
                onValueChange={setRifNit}
                startContent={<FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                variant="bordered"
                size="lg"
                description={paisConfig?.codigo === 'VE' ? 'Registro de Información Fiscal (SENIAT)' : ''}
                classNames={{
                  label: "text-foreground",
                  input: "text-foreground",
                  inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                }}
              />

              {paisConfig && paisConfig.tasa > 0 && (
                <Input
                  type="number"
                  label={<span className="font-bold">Tasa de {paisConfig.impuesto} (%)</span>}
                  placeholder={paisConfig.tasa.toString()}
                  value={tasaImpuesto || paisConfig.tasa.toString()}
                  onValueChange={setTasaImpuesto}
                  startContent={<DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />}
                  variant="bordered"
                  size="lg"
                  description={`Tasa predeterminada: ${paisConfig.tasa}%`}
                  classNames={{
                    label: "text-foreground",
                    input: "text-foreground",
                    inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                  }}
                />
              )}

              <div className="flex gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">!</span>
                  </div>
                </div>
                <p className="text-xs text-foreground font-bold leading-relaxed">
                  <span className="text-blue-600 dark:text-blue-400">Importante:</span> Eres responsable de cumplir con las obligaciones fiscales de tu país. 
                  Este sistema genera comprobantes de venta con los datos que proporciones.
                </p>
              </div>
            </form>
          )}

          {/* PASO 4: Confirmación */}
          {paso === 4 && (
            <div className="space-y-5">
              {/* Grid de información - 2 columnas en pantallas grandes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Propietario */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Propietario</h3>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    <p className="text-sm text-foreground font-semibold">{nombreCompleto}</p>
                    <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{emailPropietario}</span>
                    </div>
                    {telefonoPropietario && (
                      <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                        <Phone className="w-3 h-3" />
                        <span>{telefonoPropietario}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Negocio */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Negocio</h3>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    <p className="text-sm text-foreground font-semibold">{nombreNegocio}</p>
                    <p className="text-xs text-foreground/70">Razón Social: {nombreLegal}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <Chip size="sm" variant="flat" color="primary" className="h-5 text-[10px]">{tipoNegocio}</Chip>
                      <Chip size="sm" variant="flat" className="h-5 text-[10px]">{paisConfig?.nombre}</Chip>
                    </div>
                  </div>
                </div>

                {/* Contacto del Negocio */}
                {(telefonoNegocio || direccionNegocio) && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Contacto</h3>
                    </div>
                    <div className="space-y-1.5 pl-6">
                      {telefonoNegocio && (
                        <div className="flex items-center gap-1.5 text-xs text-foreground/70">
                          <Phone className="w-3 h-3" />
                          <span>{telefonoNegocio}</span>
                        </div>
                      )}
                      {direccionNegocio && (
                        <div className="flex items-start gap-1.5 text-xs text-foreground/70">
                          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{direccionNegocio}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Configuración Fiscal */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Configuración Fiscal</h3>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-foreground/70">Moneda:</span>
                      <Chip size="sm" variant="flat" color="success" className="h-5 text-[10px]">
                        {paisConfig?.moneda} ({paisConfig?.simbolo})
                      </Chip>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-foreground/70">Impuesto:</span>
                      <Chip size="sm" variant="flat" color="warning" className="h-5 text-[10px]">
                        {paisConfig?.impuesto} {tasaImpuesto || paisConfig?.tasa}%
                      </Chip>
                    </div>
                    {rifNit && (
                      <p className="text-xs text-foreground/70">
                        ID Fiscal: <span className="font-semibold">{rifNit}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Divider className="my-4" />

              {/* Plan de Prueba */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary mb-0.5">Plan de Prueba Gratis</p>
                  <p className="text-xs text-foreground font-bold leading-relaxed">
                    Tu negocio será registrado con 7 días de prueba gratis. Podrás acceder a todas las 
                    funcionalidades del sistema sin restricciones.
                  </p>
                </div>
              </div>

              {/* Checkbox de términos */}
              <Checkbox 
                isSelected={aceptoTerminos}
                onValueChange={setAceptoTerminos}
                size="sm"
                classNames={{
                  label: "text-xs"
                }}
              >
                <span className="text-xs text-foreground/70">
                  Acepto los términos y condiciones, y confirmo que la información proporcionada es correcta
                </span>
              </Checkbox>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex gap-3">
            {paso > 1 && (
              <Button
                size="lg"
                variant="bordered"
                className="flex-1 font-semibold"
                startContent={<ArrowLeft className="w-4 h-4" />}
                onPress={handleAnterior}
              >
                Anterior
              </Button>
            )}
            
            {paso < 4 ? (
              <Button
                size="lg"
                color="primary"
                className="flex-1 font-semibold"
                endContent={<ArrowRight className="w-4 h-4" />}
                onPress={handleSiguiente}
                isDisabled={
                  (paso === 1 && !validarPaso1()) ||
                  (paso === 2 && !validarPaso2())
                }
              >
                Siguiente
              </Button>
            ) : (
              <Button
                size="lg"
                color="primary"
                className="flex-1 font-semibold"
                endContent={<Check className="w-4 h-4" />}
                onPress={handleRegistro}
                isDisabled={!aceptoTerminos}
              >
                Registrar Negocio
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-foreground/60">
            ¿Ya tienes una cuenta?{' '}
            <a href="/" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Inicia sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
