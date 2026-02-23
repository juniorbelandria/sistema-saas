# Guía de Registro Multi-tenant - Sistema POS

## 🎯 Implementación Completada

Se ha implementado un sistema de registro modular en 3 pasos que integra completamente con la arquitectura Multi-tenant de Supabase.

## 📋 Archivos Creados/Modificados

### Nuevos Archivos
1. **`src/lib/catalogos.js`** - Funciones para cargar catálogos dinámicos
2. **`src/lib/validaciones/registro.js`** - Esquema de validación con Zod
3. **`GUIA_REGISTRO_MULTITENANT.md`** - Esta guía

### Archivos Actualizados
1. **`src/app/(auth)/register/page.js`** - Reescrito completamente con:
   - React Hook Form + Zod
   - 3 pasos de registro
   - Catálogos dinámicos
   - Integración con RPC

## 🚀 Flujo de Registro Implementado

### Paso 1: Cuenta del Propietario
**Campos:**
- Nombre Completo (requerido)
- Email (requerido, validación de formato)
- Contraseña (requerido, mínimo 8 caracteres, 1 mayúscula, 1 número)
- Confirmar Contraseña (debe coincidir)

**Validaciones:**
- Email único en el sistema
- Contraseña segura con requisitos específicos
- Confirmación de contraseña

### Paso 2: Información del Negocio
**Campos:**
- Nombre Comercial (requerido)
- Tipo de Negocio (Select con 10 opciones)
- Dirección Física (requerido)
- Teléfono de Contacto (requerido)

**Tipos de Negocio Disponibles:**
- Bodega
- Supermercado
- Farmacia
- Restaurante
- Cafetería
- Ferretería
- Tienda de Ropa
- Panadería
- Librería
- Otro

### Paso 3: Configuración Fiscal
**Campos:**
- País (Select dinámico con 18 países)
- Moneda Base (Select dinámico con 31 monedas)
- Razón Social Fiscal (requerido)
- ID Fiscal (RIF/NIT/RFC) (opcional)
- Régimen Fiscal (opcional)
- Usa Factura Electrónica (checkbox)

**Catálogos Dinámicos:**
- **18 Países:** Venezuela, Colombia, México, Argentina, Chile, Perú, Ecuador, Bolivia, Paraguay, Uruguay, Panamá, Costa Rica, Guatemala, Honduras, Nicaragua, República Dominicana, Estados Unidos, España
- **31 Monedas:** USD, EUR, VES, COP, MXN, PEN, ARS, CLP, BRL, y más

## 🔧 Proceso Técnico

### 1. Carga de Catálogos
```javascript
// Al montar el componente
useEffect(() => {
  async function cargarCatalogos() {
    const [paises, monedas] = await Promise.all([
      obtenerCatalogoPaises(),
      obtenerCatalogoMonedas()
    ]);
    setCatalogoPaises(paises);
    setCatalogoMonedas(monedas);
  }
  cargarCatalogos();
}, []);
```

### 2. Validación con Zod
```javascript
const registroSchema = z.object({
  nombreCompleto: z.string().min(3).max(100),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  // ... más campos
}).refine((data) => data.password === data.confirmarPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarPassword'],
});
```

### 3. Registro en Supabase Auth
```javascript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: values.email,
  password: values.password,
  options: {
    data: {
      nombre_completo: values.nombreCompleto
    }
  }
});
```

### 4. Registro del Negocio (RPC)
```javascript
const { data: rpcData, error: rpcError } = await supabase.rpc('registrar_usuario_con_negocio', {
  p_user_id: userId,
  p_nombre_completo: values.nombreCompleto,
  p_nombre_negocio: values.nombreNegocio,
  p_nombre_completo_negocio: values.razonSocial,
  p_direccion: values.direccion,
  p_telefono: values.telefono,
  p_email_negocio: values.email,
  p_pais_codigo: values.codigoPais,
  p_moneda_base: values.codigoMoneda,
  p_id_fiscal: values.idFiscal || null,
  p_nombre_fiscal: values.razonSocial,
  p_tipo_negocio: values.tipoNegocio,
  p_regimen_fiscal: values.regimenFiscal || null,
  p_usa_factura_electronica: values.usaFacturaElectronica,
  p_prefijo_factura: 'FAC-'
});
```

## 🎨 Características de UX

### Navegación entre Pasos
- Validación automática antes de avanzar
- Botón "Anterior" para volver
- Progress bar visual con porcentaje
- Indicadores de paso completado

### Validación en Tiempo Real
- React Hook Form con modo `onChange`
- Mensajes de error específicos por campo
- Validación de contraseña en tiempo real
- Confirmación de contraseña

### Estados de Carga
- Loading spinner al cargar catálogos
- Botón con `isLoading` durante el registro
- Deshabilitación de botones durante procesos

### Notificaciones
```javascript
// Éxito
toast.success('¡Negocio registrado! Revisa tu correo para verificar el código de 8 dígitos');

// Error
toast.error('Este correo ya está registrado');
```

## 🔐 Seguridad Implementada

### Validación de Contraseña
- Mínimo 8 caracteres
- Al menos 1 letra mayúscula
- Al menos 1 número
- Confirmación obligatoria

### Validación de Email
- Formato válido
- Conversión a minúsculas
- Verificación de duplicados en Supabase

### Validación de Datos Fiscales
- Códigos de país de 3 letras (ISO 3166-1 alpha-3)
- Códigos de moneda válidos (ISO 4217)
- Campos opcionales manejados correctamente (null)

## 🎯 Triggers Automáticos

Al registrar un negocio, la base de datos ejecuta automáticamente:

1. **Creación de Perfil** (`handle_new_user`)
   - Crea registro en tabla `perfiles`
   - Asigna rol inicial

2. **Asignación de Owner** (`asignar_owner_negocio`)
   - Vincula usuario con negocio
   - Asigna rol `super_admin` del negocio

3. **Inicialización de Impuestos** (`trigger_inicializar_impuestos`)
   - Carga impuestos del país seleccionado
   - Crea registros en `impuestos_negocio`

4. **Creación de Formato de Factura** (automático)
   - Genera formato según país
   - Configura campos requeridos

## 📊 Plan de Prueba Gratis

El sistema asigna automáticamente:
- **Plan:** `prueba_gratis`
- **Duración:** 7 días
- **Vencimiento:** `NOW() + INTERVAL '7 days'`
- **Tipo:** `free`

## 🧪 Testing

### Test 1: Registro Completo
```
1. Ir a /register
2. Paso 1: Ingresar datos del propietario
3. Paso 2: Ingresar datos del negocio
4. Paso 3: Seleccionar país y moneda
5. Verificar toast de éxito
6. Verificar redirección a /verify-email
7. Revisar email con código de 8 dígitos
```

### Test 2: Validaciones
```
1. Intentar avanzar sin completar campos
2. Verificar mensajes de error
3. Ingresar contraseña débil
4. Verificar validación de contraseña
5. Ingresar emails que no coinciden
6. Verificar validación de confirmación
```

### Test 3: Catálogos
```
1. Verificar que se cargan 18 países
2. Verificar que se cargan 31 monedas
3. Buscar país específico en Select
4. Verificar que muestra impuesto del país
5. Seleccionar moneda y verificar símbolo
```

### Test 4: Email Duplicado
```
1. Registrar un usuario
2. Intentar registrar con el mismo email
3. Verificar mensaje de error
4. Verificar que no se crea negocio duplicado
```

## 🐛 Manejo de Errores

### Errores de Auth
```javascript
if (authError.message.includes('already registered')) {
  throw new Error('Este correo ya está registrado');
}
```

### Errores de RPC
```javascript
if (rpcData && !rpcData.success) {
  throw new Error(rpcData.error || 'Error al registrar el negocio');
}
```

### Errores de Catálogos
```javascript
if (paises.length === 0 || monedas.length === 0) {
  toast.error('Error al cargar los catálogos. Por favor recarga la página.');
}
```

## 📱 Responsive Design

- Mobile: Columna única, logo arriba
- Desktop: 2 columnas (branding + formulario)
- Inputs adaptables: `min-h-[52px]`
- Select con scroll para muchas opciones

## 🎨 Colores y Tema

- **Primary:** Acciones principales (botones, progress)
- **Success:** Pasos completados
- **Default:** Estados inactivos
- **Danger:** Errores de validación

## 💡 Tips de Implementación

### Dato Curioso
Al usar `registrar_usuario_con_negocio`, la base de datos dispara automáticamente los triggers que:
- Crean el formato de factura según el país
- Cargan los impuestos correspondientes
- Configuran la moneda base
- Asignan el plan de prueba de 7 días

¡No tienes que hacer nada de eso en el código!

### Seguridad
El sistema maneja automáticamente:
- Verificación de email duplicado
- Validación de códigos de país/moneda
- Protección contra inyección SQL (RPC)
- Encriptación de contraseñas (Supabase Auth)

### Países y Monedas
Como son muchos (18 y 31), el componente Select de Hero UI es ideal porque:
- Tiene scroll automático
- Permite búsqueda rápida
- Muestra información adicional (impuesto, símbolo)
- Es responsive

## 🔄 Flujo Post-Registro

1. Usuario completa los 3 pasos
2. Se ejecuta `supabase.auth.signUp()`
3. Se ejecuta `supabase.rpc('registrar_usuario_con_negocio')`
4. Toast: "¡Negocio registrado! Revisa tu correo..."
5. Redirección a `/verify-email?email=X&type=signup`
6. Usuario ingresa código de 8 dígitos
7. Verificación exitosa
8. Redirección a `/admin/dashboard`

## 📞 Próximos Pasos

1. Configurar Supabase según `CONFIGURACION_SUPABASE_OTP.md`
2. Ejecutar los scripts SQL en orden:
   - `01_database_structure.sql`
   - `02_data_inserts.sql`
   - `03_functions.sql`
   - `04_triggers.sql`
   - `05_permissions.sql`
3. Probar el flujo completo de registro
4. Verificar que los triggers funcionan correctamente
5. Personalizar los templates de email en Supabase

## 🎉 Resultado Final

Un sistema de registro profesional que:
- ✅ Valida datos en tiempo real
- ✅ Carga catálogos dinámicamente
- ✅ Registra usuario y negocio simultáneamente
- ✅ Configura automáticamente impuestos y formato de factura
- ✅ Asigna plan de prueba de 7 días
- ✅ Envía código OTP de 8 dígitos
- ✅ Maneja errores gracefully
- ✅ Es completamente responsive
- ✅ Usa los colores del tema
- ✅ Tiene excelente UX
