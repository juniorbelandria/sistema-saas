'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, SelectItem, Checkbox, Card, CardBody, Chip, Avatar } from '@heroui/react';
import { 
  ArrowRight, ArrowLeft, Check, User, Building2, FileText, 
  Mail, Lock, Phone, MapPin, Globe, DollarSign, CheckCircle2 
} from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import DevNavigation from '@/components/DevNavigation';
import { supabase } from '@/lib/supabase';
import { obtenerCatalogoPaises, obtenerCatalogoMonedas } from '@/lib/catalogos';
import { registroSchema, TIPOS_NEGOCIO } from '@/lib/validaciones/registro';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  const router = useRouter();
  const [paso, setPaso] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [catalogoPaises, setCatalogoPaises] = useState([]);
  const [catalogoMonedas, setCatalogoMonedas] = useState([]);
  const [loadingCatalogos, setLoadingCatalogos] = useState(true);

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registroSchema),
    mode: 'onChange',
    defaultValues: {
      nombreCompleto: '',
      email: '',
      password: '',
      confirmarPassword: '',
      nombreNegocio: '',
      tipoNegocio: '',
      direccion: '',
      telefono: '',
      codigoPais: '',
      codigoMoneda: '',
      idFiscal: '',
      razonSocial: '',
      regimenFiscal: '',
      usaFacturaElectronica: false,
    }
  });

  const password = watch('password');
  const confirmarPassword = watch('confirmarPassword');
  const codigoPais = watch('codigoPais');

  // Cargar catálogos al montar el componente
  useEffect(() => {
    async function cargarCatalogos() {
      setLoadingCatalogos(true);
      try {
        const [paises, monedas] = await Promise.all([
          obtenerCatalogoPaises(),
          obtenerCatalogoMonedas()
        ]);
        
        setCatalogoPaises(paises);
        setCatalogoMonedas(monedas);
        
        if (paises.length === 0 || monedas.length === 0) {
          toast.error('Error al cargar los catálogos. Por favor recarga la página.');
        }
      } catch (error) {
        console.error('Error cargando catálogos:', error);
        toast.error('Error al cargar los catálogos');
      } finally {
        setLoadingCatalogos(false);
      }
    }

    cargarCatalogos();
  }, []);

  const progreso = (paso / 4) * 100;

  // Validar paso actual antes de avanzar
  const validarPasoActual = async () => {
    let camposAValidar = [];
    
    if (paso === 1) {
      camposAValidar = ['nombreCompleto', 'email', 'password', 'confirmarPassword'];
    } else if (paso === 2) {
      camposAValidar = ['nombreNegocio', 'tipoNegocio', 'direccion', 'telefono'];
    } else if (paso === 3) {
      camposAValidar = ['codigoPais', 'codigoMoneda', 'razonSocial'];
    }

    const resultado = await trigger(camposAValidar);
    return resultado;
  };

  const handleSiguiente = async () => {
    const esValido = await validarPasoActual();
    if (esValido) {
      setPaso(paso + 1);
    } else {
      toast.error('Por favor completa todos los campos requeridos');
    }
  };

  const handleAnterior = () => {
    setPaso(paso - 1);
  };

  // Función principal de registro
  const onSubmit = async (values) => {
    setIsLoading(true);

    try {
      // Validación adicional de contraseñas
      if (values.password !== values.confirmarPassword) {
        toast.error('Las contraseñas no coinciden');
        setIsLoading(false);
        return;
      }

      // Paso 1: Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            nombre_completo: values.nombreCompleto,
            full_name: values.nombreCompleto, // Para compatibilidad
            display_name: values.nombreCompleto, // Display name para auth.users
            // Guardar datos del negocio en metadata para usarlos después de la verificación
            datos_negocio: {
              nombreNegocio: values.nombreNegocio,
              nombreCompleto: values.nombreCompleto,
              razonSocial: values.razonSocial,
              direccion: values.direccion,
              telefono: values.telefono,
              codigoPais: values.codigoPais,
              codigoMoneda: values.codigoMoneda,
              idFiscal: values.idFiscal || null,
              tipoNegocio: values.tipoNegocio,
              regimenFiscal: values.regimenFiscal || null,
              usaFacturaElectronica: values.usaFacturaElectronica
            }
          },
          emailRedirectTo: `${window.location.origin}/admin/dashboard`
        }
      });

      if (authError) {
        console.error('Error de autenticación:', authError);
        
        // Detectar si el correo ya está registrado
        if (authError.message.includes('already registered') || 
            authError.message.includes('User already registered') ||
            authError.message.includes('already been registered') ||
            authError.status === 422 ||
            authError.message.includes('duplicate')) {
          toast.error('Este correo ya está registrado. Por favor inicia sesión o usa otro correo.');
          setIsLoading(false);
          return;
        }
        
        // Otros errores
        toast.error(authError.message || 'Error al crear la cuenta');
        setIsLoading(false);
        return;
      }

      // Verificar si realmente se creó el usuario
      if (!authData.user) {
        toast.error('No se pudo crear el usuario. Intenta con otro correo.');
        setIsLoading(false);
        return;
      }

      // Verificar si el usuario ya existía (Supabase a veces devuelve el usuario existente sin error)
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        toast.error('Este correo ya está registrado. Por favor inicia sesión.');
        setIsLoading(false);
        return;
      }

      // Éxito - Usuario creado, ahora debe verificar su email
      toast.success('Registro exitoso. Revisa tu correo para verificar el código de 8 dígitos');
      
      // Redirigir a verificación de email
      router.push(`/verify-email?email=${encodeURIComponent(values.email)}&type=signup`);

    } catch (error) {
      console.error('Error en registro:', error);
      toast.error(error.message || 'Error al registrar. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingCatalogos) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-foreground/60">Cargando catálogos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background relative">
      {/* Theme Toggle y Dev Navigation */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
        <DevNavigation />
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

          {/* Pasos del proceso */}
          <div className="space-y-3 mb-6">
            {[
              { num: 1, icon: User, titulo: 'Cuenta del Propietario', desc: 'Información personal y credenciales de acceso' },
              { num: 2, icon: Building2, titulo: 'Información del Negocio', desc: 'Datos comerciales y ubicación' },
              { num: 3, icon: FileText, titulo: 'Configuración Fiscal', desc: 'Datos tributarios y moneda' },
              { num: 4, icon: CheckCircle2, titulo: 'Confirmación', desc: 'Revisa y confirma tu información' }
            ].map((item) => {
              const Icon = item.icon;
              const isCompleted = paso > item.num;
              const isCurrent = paso === item.num;

              return (
                <div key={item.num} className="flex items-start gap-3">
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
                  
                  <div className="flex-1">
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

          {/* Progress Bar */}
          <Card className="mb-6 border-none shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Chip color="primary" variant="flat" size="sm">
                    <span className="font-bold">Paso {paso} de 4</span>
                  </Chip>
                  <span className="text-xs text-foreground/60 font-bold">
                    {paso === 1 && 'Cuenta del Propietario'}
                    {paso === 2 && 'Información del Negocio'}
                    {paso === 3 && 'Configuración Fiscal'}
                    {paso === 4 && 'Confirmación'}
                  </span>
                </div>
                <span className="text-xs font-bold text-primary">{Math.round(progreso)}%</span>
              </div>
              
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
              {paso === 1 && 'Cuenta del Propietario'}
              {paso === 2 && 'Información del Negocio'}
              {paso === 3 && 'Configuración Fiscal'}
              {paso === 4 && 'Confirmación'}
            </h2>
            <p className="text-sm text-foreground/60 font-semibold">
              {paso === 1 && 'Crea tu cuenta de acceso'}
              {paso === 2 && 'Datos de tu negocio'}
              {paso === 3 && 'Configuración tributaria'}
              {paso === 4 && 'Revisa y confirma tu registro'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* PASO 1: Cuenta del Propietario */}
            {paso === 1 && (
              <div className="space-y-5">
                <Controller
                  name="nombreCompleto"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Nombre Completo"
                      placeholder="Juan Pérez"
                      startContent={<User className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      isInvalid={!!errors.nombreCompleto}
                      errorMessage={errors.nombreCompleto?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      label="Correo Electrónico"
                      placeholder="tu@email.com"
                      startContent={<Mail className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      isInvalid={!!errors.email}
                      errorMessage={errors.email?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="password"
                      label="Contraseña"
                      placeholder="Mínimo 8 caracteres"
                      startContent={<Lock className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      isInvalid={!!errors.password}
                      errorMessage={errors.password?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="confirmarPassword"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <Input
                        {...field}
                        type="password"
                        label="Confirmar Contraseña"
                        placeholder="Repite tu contraseña"
                        startContent={<Lock className="w-5 h-5" />}
                        variant="bordered"
                        size="lg"
                        isRequired
                        isInvalid={!!errors.confirmarPassword}
                        errorMessage={errors.confirmarPassword?.message}
                        classNames={{
                          label: "text-foreground font-bold",
                          input: "text-foreground",
                          inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                        }}
                      />
                      {/* Indicador visual de coincidencia */}
                      {confirmarPassword && password && (
                        <div className={`flex items-center gap-2 text-xs font-semibold ${
                          password === confirmarPassword 
                            ? 'text-success' 
                            : 'text-danger'
                        }`}>
                          {password === confirmarPassword ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Las contraseñas coinciden</span>
                            </>
                          ) : (
                            <>
                              <span className="w-4 h-4 flex items-center justify-center">✕</span>
                              <span>Las contraseñas no coinciden</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                />
              </div>
            )}

            {/* PASO 2: Información del Negocio */}
            {paso === 2 && (
              <div className="space-y-5">
                <Controller
                  name="nombreNegocio"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Nombre Comercial"
                      placeholder="Mi Bodega"
                      startContent={<Building2 className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      isInvalid={!!errors.nombreNegocio}
                      errorMessage={errors.nombreNegocio?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="tipoNegocio"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Tipo de Negocio"
                      placeholder="Selecciona el tipo"
                      variant="bordered"
                      size="lg"
                      isRequired
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                      isInvalid={!!errors.tipoNegocio}
                      errorMessage={errors.tipoNegocio?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        trigger: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    >
                      {TIPOS_NEGOCIO.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="direccion"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Dirección Física"
                      placeholder="Av. Principal, Local 123"
                      startContent={<MapPin className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      isInvalid={!!errors.direccion}
                      errorMessage={errors.direccion?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="telefono"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="tel"
                      label="Teléfono de Contacto"
                      placeholder="+58 212 1234567"
                      startContent={<Phone className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      isInvalid={!!errors.telefono}
                      errorMessage={errors.telefono?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />
              </div>
            )}

            {/* PASO 3: Configuración Fiscal */}
            {paso === 3 && (
              <div className="space-y-5">
                <Controller
                  name="codigoPais"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="País"
                      placeholder="Selecciona tu país"
                      variant="bordered"
                      size="lg"
                      isRequired
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                      isInvalid={!!errors.codigoPais}
                      errorMessage={errors.codigoPais?.message}
                      startContent={<Globe className="w-5 h-5" />}
                      classNames={{
                        label: "text-foreground font-bold",
                        trigger: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    >
                      {catalogoPaises.map((pais) => (
                        <SelectItem 
                          key={pais.codigo} 
                          value={pais.codigo}
                          textValue={pais.nombre}
                        >
                          <div className="flex items-center gap-2">
                            <span>{pais.nombre}</span>
                            <span className="text-xs text-foreground/60">
                              ({pais.impuesto_principal} {pais.tasa_impuesto_general}%)
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="codigoMoneda"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Moneda Base"
                      placeholder="Selecciona la moneda"
                      variant="bordered"
                      size="lg"
                      isRequired
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => field.onChange(Array.from(keys)[0])}
                      isInvalid={!!errors.codigoMoneda}
                      errorMessage={errors.codigoMoneda?.message}
                      startContent={<DollarSign className="w-5 h-5" />}
                      classNames={{
                        label: "text-foreground font-bold",
                        trigger: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    >
                      {catalogoMonedas.map((moneda) => (
                        <SelectItem 
                          key={moneda.codigo} 
                          value={moneda.codigo}
                          textValue={`${moneda.nombre} (${moneda.simbolo})`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{moneda.simbolo}</span>
                            <span>{moneda.nombre}</span>
                            <span className="text-xs text-foreground/60">({moneda.codigo})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                <Controller
                  name="razonSocial"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Nombre/Razón Social Fiscal"
                      placeholder="Mi Bodega C.A."
                      startContent={<FileText className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isRequired
                      isInvalid={!!errors.razonSocial}
                      errorMessage={errors.razonSocial?.message}
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="idFiscal"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="ID Fiscal (RIF/NIT/RFC)"
                      placeholder={
                        codigoPais === 'VEN' ? 'J-12345678-9' :
                        codigoPais === 'MEX' ? 'ABC123456789' :
                        codigoPais === 'COL' ? '900123456-7' :
                        'Número de identificación fiscal'
                      }
                      startContent={<FileText className="w-5 h-5" />}
                      variant="bordered"
                      size="lg"
                      isInvalid={!!errors.idFiscal}
                      errorMessage={errors.idFiscal?.message}
                      description="Opcional"
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="regimenFiscal"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Régimen Fiscal"
                      placeholder="Régimen General, Simplificado, etc."
                      variant="bordered"
                      size="lg"
                      description="Opcional"
                      classNames={{
                        label: "text-foreground font-bold",
                        input: "text-foreground",
                        inputWrapper: "border-default-200 hover:border-default-400 data-[focus=true]:border-primary min-h-[52px]"
                      }}
                    />
                  )}
                />

                <Controller
                  name="usaFacturaElectronica"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      isSelected={field.value}
                      onValueChange={field.onChange}
                      size="sm"
                    >
                      <span className="text-sm text-foreground">
                        Usa Factura Electrónica
                      </span>
                    </Checkbox>
                  )}
                />

                <div className="flex gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <div className="flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">!</span>
                    </div>
                  </div>
                  <p className="text-xs text-foreground font-bold leading-relaxed">
                    <span className="text-blue-600 dark:text-blue-400">Importante:</span> Los impuestos y formato de factura 
                    se configurarán automáticamente según el país seleccionado.
                  </p>
                </div>
              </div>
            )}

            {/* PASO 4: Confirmación */}
            {paso === 4 && (
              <div className="space-y-5">
                {/* Sección: Propietario */}
                <Card className="border-none shadow-sm bg-content2">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">PROPIETARIO</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Nombre Completo:</span>
                        <span className="text-xs font-semibold text-foreground">{watch('nombreCompleto')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Correo Electrónico:</span>
                        <span className="text-xs font-semibold text-foreground">{watch('email')}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Sección: Negocio */}
                <Card className="border-none shadow-sm bg-content2">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">NEGOCIO</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Nombre Comercial:</span>
                        <span className="text-xs font-semibold text-foreground">{watch('nombreNegocio')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Tipo de Negocio:</span>
                        <span className="text-xs font-semibold text-foreground">
                          {TIPOS_NEGOCIO.find(t => t.value === watch('tipoNegocio'))?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Razón Social:</span>
                        <span className="text-xs font-semibold text-foreground">{watch('razonSocial')}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Sección: Contacto */}
                <Card className="border-none shadow-sm bg-content2">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">CONTACTO</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Teléfono:</span>
                        <span className="text-xs font-semibold text-foreground">{watch('telefono')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Dirección:</span>
                        <span className="text-xs font-semibold text-foreground text-right max-w-[60%]">{watch('direccion')}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Sección: Configuración Fiscal */}
                <Card className="border-none shadow-sm bg-content2">
                  <CardBody className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <h3 className="text-sm font-bold text-foreground">CONFIGURACIÓN FISCAL</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">País:</span>
                        <span className="text-xs font-semibold text-foreground">
                          {catalogoPaises.find(p => p.codigo === watch('codigoPais'))?.nombre}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Moneda:</span>
                        <span className="text-xs font-semibold text-foreground">
                          {catalogoMonedas.find(m => m.codigo === watch('codigoMoneda'))?.nombre} ({catalogoMonedas.find(m => m.codigo === watch('codigoMoneda'))?.simbolo})
                        </span>
                      </div>
                      {watch('idFiscal') && (
                        <div className="flex justify-between">
                          <span className="text-xs text-foreground/60">ID Fiscal:</span>
                          <span className="text-xs font-semibold text-foreground">{watch('idFiscal')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-xs text-foreground/60">Factura Electrónica:</span>
                        <span className="text-xs font-semibold text-foreground">
                          {watch('usaFacturaElectronica') ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Plan de Prueba */}
                <Card className="border-none shadow-sm bg-primary/10 border-primary/30">
                  <CardBody className="p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-1">Plan de Prueba Gratis</h3>
                        <p className="text-xs text-foreground/70 leading-relaxed">
                          Tu negocio será registrado con 7 días de prueba gratis. Podrás acceder a todas las funcionalidades del sistema sin restricciones.
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Checkbox de confirmación */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-content2">
                  <Checkbox size="sm" defaultSelected />
                  <span className="text-xs text-foreground/70 leading-relaxed">
                    Acepto los términos y condiciones, y confirmo que la información proporcionada es correcta
                  </span>
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex gap-3 pt-4">
              {paso > 1 && (
                <Button
                  type="button"
                  size="lg"
                  variant="bordered"
                  className="flex-1 font-semibold"
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  onPress={handleAnterior}
                  isDisabled={isLoading}
                >
                  Anterior
                </Button>
              )}
              
              {paso < 4 ? (
                <Button
                  type="button"
                  size="lg"
                  color="primary"
                  className="flex-1 font-semibold"
                  endContent={<ArrowRight className="w-4 h-4" />}
                  onPress={handleSiguiente}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="lg"
                  color="primary"
                  className="flex-1 font-semibold"
                  endContent={!isLoading && <Check className="w-4 h-4" />}
                  isLoading={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Confirmar y Registrar'}
                </Button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-xs sm:text-sm text-foreground/60">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Inicia sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
