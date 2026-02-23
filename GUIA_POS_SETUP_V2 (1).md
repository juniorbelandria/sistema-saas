# 🏪 Guía Completa — Sistema POS V2
### Next.js + Supabase + HeroUI + Stack Completo
#### Versión actualizada — JavaScript (sin TypeScript) + HeroUI

---

## ⚠️ CORRECCIONES CRÍTICAS vs. versión anterior

Después de releer TODOS los archivos SQL con cuidado, estas son las correcciones importantes:

### 1. El Super Admin Global SÍ tiene `rol = 'super_admin'` en la tabla `perfiles`
```sql
-- función registrar_super_admin_global() línea 509:
INSERT INTO perfiles (id, nombre_completo, rol, is_super_admin, negocio_id, activo)
VALUES (v_user_id, p_nombre_completo, 'super_admin', TRUE, NULL, TRUE)
```
La diferencia con el dueño de negocio es:
- `is_super_admin = TRUE` → Admin de la plataforma (ve todo, sin restricción de plan)
- `negocio_id = NULL` → Nunca tiene negocio propio
- El dueño de negocio tiene `is_super_admin = FALSE` y `negocio_id = <uuid>`

### 2. El primer Super Admin puede crearse SIN necesidad de uno existente
```sql
-- función registrar_super_admin_global() línea 483-492:
SELECT EXISTS(SELECT 1 FROM perfiles WHERE is_super_admin = TRUE) INTO v_hay_super_admins;
IF v_hay_super_admins AND NOT COALESCE(v_caller_is_super_admin, FALSE) THEN
    -- Rechazar solo si YA existen super admins
END IF;
-- Si no hay ninguno → se permite crear el primero libremente
```
Esto significa que hay una **pantalla de setup inicial** para el primer Super Admin.

### 3. Existen DOS funciones para crear Super Admin Global
- `registrar_super_admin_global(email, nombre, notas)` — el usuario ya debe existir en auth
- `convertir_a_super_admin_global(user_id)` — promueve a un usuario existente
- En ambos casos el usuario NO puede tener negocio registrado

### 4. La función `registrar_usuario_con_negocio()` tiene validación de nombre del negocio
- `p_nombre_negocio` = nombre corto/comercial
- `p_nombre_completo_negocio` = nombre legal/fiscal (puede ser igual)
- El campo `nombre_completo` en `configuracion` es el nombre LEGAL, no el del dueño

### 5. El dueño del negocio queda con rol `super_admin` (del negocio), NO `admin`
```sql
-- función asignar_owner_negocio() línea 314:
SET rol = 'super_admin', negocio_id = NEW.id, is_super_admin = FALSE
```
Es decir: `rol = 'super_admin'` + `is_super_admin = FALSE` = dueño de su negocio

### 6. Existe tabla `ventas_detalle_impuestos` (no estaba documentada antes)
Para países que requieren desglose de impuesto por línea de producto (Venezuela, Colombia, etc.)

### 7. La RLS de `configuracion` solo muestra el negocio al `owner_id`
```sql
CREATE POLICY "config_select" ON configuracion FOR SELECT
    USING (owner_id = auth.uid() OR is_super_admin_global());
```
Los cajeros/vendedores/contadores NO ven `configuracion` directamente — acceden via funciones helper.

---

## 📦 ÍNDICE

1. [Stack Tecnológico](#stack)
2. [Instalación — Comandos completos](#instalacion)
3. [Estructura del Proyecto](#estructura)
4. [Flujo de Auth — Mapa completo](#flujo-auth)
5. [Pantallas y Campos](#pantallas)
   - 5.1 Login
   - 5.2 Registro de usuario
   - 5.3 Verificación de email
   - 5.4 Registro del negocio (multi-paso)
   - 5.5 Recuperación de contraseña
   - 5.6 Setup inicial — Primer Super Admin Global
   - 5.7 Panel Super Admin — Gestión de Super Admins adicionales
6. [Dashboard Admin del Negocio](#dashboard-admin)
7. [Dashboard Super Admin Global](#dashboard-superadmin)
8. [Variables de Entorno](#env)
9. [Middleware de protección de rutas](#middleware)

---

## 1. STACK TECNOLÓGICO {#stack}

| Categoría | Librería | Comando |
|---|---|---|
| Framework | Next.js 14 (App Router) | `create-next-app` |
| Auth + DB + Realtime | Supabase | `@supabase/supabase-js` + `@supabase/ssr` |
| Data fetching / caché | TanStack React Query | `@tanstack/react-query` |
| UI base | HeroUI + Tailwind CSS | `@heroui/react` |
| Íconos | Lucide React | `lucide-react` |
| Tablas avanzadas | TanStack React Table | `@tanstack/react-table` |
| Gráficos | Recharts | `recharts` |
| Formularios | React Hook Form | `react-hook-form` |
| Validación | Zod | `zod` + `@hookform/resolvers` |
| Estado global | Zustand | `zustand` |
| PDF en JSX (facturas) | @react-pdf/renderer | `@react-pdf/renderer` |
| PDF tabular (reportes) | pdfmake | `pdfmake` |
| Monedas sin float errors | Dinero.js | `dinero.js` + `@dinero.js/currencies` |
| Notificaciones toast | Sonner | `sonner` |
| Lector código de barras | @ericblade/quagga2 | `@ericblade/quagga2` |
| Fechas | date-fns | `date-fns` |

> ⚠️ **Este proyecto usa JavaScript puro (`.js` / `.jsx`) — sin TypeScript.**

---

## 2. INSTALACIÓN — COMANDOS COMPLETOS {#instalacion}

### PASO 1 — Crear proyecto Next.js (sin TypeScript)

```bash
npx create-next-app@latest pos-v2 \
  --no-typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd pos-v2
```

---

### PASO 2 — Instalar y configurar HeroUI

```bash
npm install @heroui/react framer-motion
```

Agregar el provider en `src/app/layout.js`:

```jsx
// src/app/layout.js
import { HeroUIProvider } from '@heroui/react'

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  )
}
```

Actualizar `tailwind.config.js` para incluir HeroUI:

```js
// tailwind.config.js
const { heroui } = require('@heroui/react')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [heroui()],
}
```

---

### PASO 3 — Instalar todas las dependencias restantes

```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  @tanstack/react-table \
  lucide-react \
  recharts \
  react-hook-form \
  zod \
  @hookform/resolvers \
  zustand \
  @react-pdf/renderer \
  pdfmake \
  dinero.js \
  @dinero.js/currencies \
  sonner \
  @ericblade/quagga2 \
  date-fns
```

---

### PASO 4 — Configurar next.config.js para PDF

```js
// next.config.js
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
module.exports = nextConfig;
```

---

## 3. ESTRUCTURA DEL PROYECTO {#estructura}

> Todos los archivos usan extensión `.js` o `.jsx` — sin `.ts` ni `.tsx`.

```
pos-v2/
├── src/
│   ├── app/
│   │   │
│   │   ├── (auth)/                        ← Sin sidebar, layout centrado
│   │   │   ├── login/page.jsx
│   │   │   ├── register/page.jsx
│   │   │   ├── verify-email/page.jsx
│   │   │   ├── forgot-password/page.jsx
│   │   │   ├── reset-password/page.jsx
│   │   │   ├── setup-negocio/page.jsx     ← Registro negocio (3 pasos)
│   │   │   └── layout.jsx
│   │   │
│   │   ├── (admin)/                       ← Dashboard dueño/admin del negocio
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── productos/page.jsx
│   │   │   ├── ventas/
│   │   │   │   ├── page.jsx
│   │   │   │   └── nueva/page.jsx         ← Pantalla POS (cajero)
│   │   │   ├── clientes/page.jsx
│   │   │   ├── caja/page.jsx
│   │   │   ├── fiados/page.jsx
│   │   │   ├── inventario/page.jsx
│   │   │   ├── devoluciones/page.jsx
│   │   │   ├── gastos/page.jsx
│   │   │   ├── reportes/page.jsx
│   │   │   ├── equipo/page.jsx            ← Gestión usuarios del negocio
│   │   │   ├── configuracion/page.jsx
│   │   │   └── layout.jsx
│   │   │
│   │   ├── (superadmin)/                  ← Dashboard Super Admin Global
│   │   │   ├── dashboard/page.jsx
│   │   │   ├── negocios/
│   │   │   │   ├── page.jsx               ← Lista todos los negocios
│   │   │   │   └── [id]/page.jsx          ← Detalle de un negocio
│   │   │   ├── usuarios/page.jsx
│   │   │   ├── super-admins/page.jsx      ← Gestionar otros super admins
│   │   │   ├── planes/page.jsx            ← Activar/gestionar planes
│   │   │   ├── auditoria/page.jsx         ← audit_logs global
│   │   │   ├── catalogos/page.jsx         ← catálogo_paises, monedas, impuestos
│   │   │   └── layout.jsx
│   │   │
│   │   ├── setup-inicial/page.jsx         ← Pantalla pública: crear primer super admin
│   │   │
│   │   ├── auth/callback/route.js         ← Callback Supabase OAuth / magic link
│   │   ├── layout.jsx                     ← Root layout (providers globales)
│   │   └── page.jsx                       ← Redirect inteligente según auth
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── RegisterForm.jsx
│   │   │   ├── VerifyEmailForm.jsx
│   │   │   ├── ForgotPasswordForm.jsx
│   │   │   ├── ResetPasswordForm.jsx
│   │   │   ├── SetupNegocioForm/
│   │   │   │   ├── index.jsx              ← Contenedor multi-paso con stepper
│   │   │   │   ├── Paso1Propietario.jsx
│   │   │   │   ├── Paso2Negocio.jsx
│   │   │   │   └── Paso3Fiscal.jsx
│   │   │   └── SetupInicialSuperAdmin.jsx ← Solo se muestra si NO hay super admins
│   │   ├── dashboard/
│   │   │   ├── admin/
│   │   │   │   ├── KPICards.jsx
│   │   │   │   ├── VentasChart.jsx
│   │   │   │   ├── StockBajoAlert.jsx
│   │   │   │   ├── FiadosVencidos.jsx
│   │   │   │   ├── ResumenFinanciero.jsx
│   │   │   │   └── PlanVencidoBanner.jsx
│   │   │   └── superadmin/
│   │   │       ├── GlobalKPIs.jsx
│   │   │       ├── NegociosTable.jsx
│   │   │       ├── GestionPlanDrawer.jsx
│   │   │       └── SuperAdminsTable.jsx
│   │   ├── layout/
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── SuperAdminSidebar.jsx
│   │   │   └── TopBar.jsx
│   │   └── shared/
│   │       ├── CurrencyDisplay.jsx        ← Renderiza montos con Dinero.js
│   │       ├── PaisFlag.jsx               ← Bandera por código de país
│   │       ├── PlanBadge.jsx              ← Badge de color según plan_estado
│   │       └── RolBadge.jsx
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.js                  ← createBrowserClient (componentes cliente)
│   │   │   ├── server.js                  ← createServerClient (Server Components)
│   │   │   └── middleware.js              ← createServerClient para middleware
│   │   ├── validations/
│   │   │   ├── auth.schemas.js            ← Zod schemas: login, register, etc.
│   │   │   ├── negocio.schemas.js         ← Zod schemas: los 3 pasos del setup
│   │   │   └── superadmin.schemas.js
│   │   └── utils.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js                     ← Sesión activa, perfil, is_super_admin
│   │   ├── useNegocio.js                  ← Config del negocio, plan_estado
│   │   └── usePerfil.js
│   │
│   ├── stores/
│   │   ├── authStore.js                   ← Zustand: sesión + perfil
│   │   └── negocioStore.js                ← Zustand: config activa del negocio
│   │
│   └── middleware.js                      ← Protección de rutas
│
├── public/
├── .env.local
├── next.config.js
└── tailwind.config.js
```

---

## 4. FLUJO DE AUTH — MAPA COMPLETO {#flujo-auth}

```
Usuario nuevo
    │
    ▼
/register ──────────────────────────────────────────────────────────┐
    │  (crea cuenta en auth.users)                                   │
    │  (trigger handle_new_user crea perfil con rol=NULL,            │
    │   negocio_id=NULL, is_super_admin=FALSE)                       │
    ▼                                                                 │
/verify-email ◄─────── reenvío de código ─────────────────────────  │
    │  (supabase.auth.verifyOtp)                                     │
    ▼                                                                 │
email_confirmed_at ≠ NULL                                            │
    │                                                                 │
    ▼                                                                 │
/setup-negocio ← OBLIGATORIO si negocio_id = NULL                   │
    │  (llama a registrar_usuario_con_negocio())                     │
    │  perfil queda: rol='super_admin', is_super_admin=FALSE,        │
    │  negocio_id = <uuid>, plan_estado='prueba_gratis' (7 días)     │
    ▼                                                                 │
/dashboard (admin del negocio)                                       │
                                                                      │
Usuario existente                                                     │
    │                                                                 │
    ▼                                                                 │
/login                                                                │
    │                                                                 │
    ├─── is_super_admin = TRUE ──────────────────► /superadmin/dashboard
    │
    ├─── negocio_id = NULL  ─────────────────────► /setup-negocio
    │    (registró cuenta pero no completó negocio)
    │
    ├─── email_confirmed_at = NULL ──────────────► /verify-email
    │
    └─── negocio_id ≠ NULL + email confirmado ──► /dashboard
         │
         ├─── plan_estado = 'prueba_gratis' ──► Banner: "X días restantes"
         ├─── plan_estado = 'activo'        ──► Normal
         ├─── plan_estado = 'vencido'       ──► Banner rojo + acceso limitado
         └─── plan_estado = 'suspendido'    ──► Página de cuenta suspendida

/setup-inicial  (SOLO si NO existe ningún super admin global)
    │  → Muestra formulario de primer Super Admin
    │  → Usa registrar_super_admin_global() 
    │    (permitido porque no hay ninguno aún)
    ▼
/superadmin/dashboard
```

---

## 5. PANTALLAS Y CAMPOS {#pantallas}

---

### 5.1 LOGIN `/login`

**Tabla:** `auth.users` via Supabase Auth

| Campo | Tipo HTML | Validación Zod | Notas |
|---|---|---|---|
| Email | `input type="email"` | `z.string().email()` | Identificador principal |
| Contraseña | `input type="password"` | `z.string().min(6)` | Manejado por Supabase |
| Recordarme | `checkbox` | `z.boolean().optional()` | Controla `persistSession` |

**Links en la pantalla:**
- "¿Olvidaste tu contraseña?" → `/forgot-password`
- "¿No tienes cuenta?" → `/register`

**Lógica post-login (en este orden exacto):**
```js
// 1. Obtener perfil del usuario
const { data: perfil } = await supabase.from('perfiles').select('*').eq('id', user.id).single()

// 2. Decidir destino
if (perfil.is_super_admin) return redirect('/superadmin/dashboard')
if (!user.email_confirmed_at) return redirect('/verify-email')
if (!perfil.negocio_id) return redirect('/setup-negocio')
return redirect('/dashboard')
// El plan_estado se maneja con banners dentro del dashboard, no bloqueando el acceso al login
```

---

### 5.2 REGISTRO DE USUARIO `/register`

**Tabla:** `auth.users` + `perfiles` (via trigger automático)

| Campo | Tipo HTML | Validación Zod | Columna DB |
|---|---|---|---|
| Nombre completo | `input type="text"` | `z.string().min(3).max(100)` | `perfiles.nombre_completo` / `raw_user_meta_data` |
| Email | `input type="email"` | `z.string().email()` | `auth.users.email` |
| Contraseña | `input type="password"` | `z.string().min(8).regex(/[0-9]/, 'Al menos 1 número')` | `auth.users.password` |
| Confirmar contraseña | `input type="password"` | `.refine(val => val === pass, 'No coinciden')` | Solo frontend |

**Llamada a Supabase:**
```js
const { error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { nombre_completo }, // va a raw_user_meta_data → trigger lo usa
    emailRedirectTo: `${origin}/auth/callback`,
  }
})
// Post-registro: redirect a /verify-email
```

**Notas:**
- Después del `signUp`, el trigger `handle_new_user` crea automáticamente la fila en `perfiles` con `rol=NULL`, `negocio_id=NULL`, `is_super_admin=FALSE`
- El usuario NO puede operar hasta verificar email Y completar setup del negocio

---

### 5.3 VERIFICACIÓN DE EMAIL `/verify-email`

**Tabla:** `auth.users.email_confirmed_at`

| Campo | Tipo HTML | Validación Zod | Notas |
|---|---|---|---|
| Código OTP | `input type="text"` (6 dígitos) | `z.string().length(6).regex(/^\d+$/)` | Enviado al email |

**Llamada a Supabase:**
```js
const { error } = await supabase.auth.verifyOtp({
  email,
  token: codigoOtp,
  type: 'signup'
})
// Si ok → redirect a /setup-negocio (si negocio_id = null) o /dashboard
```

**Reenvío del código:**
```js
await supabase.auth.resend({ type: 'signup', email })
```

---

### 5.4 REGISTRO DEL NEGOCIO `/setup-negocio`

**Multi-paso (3 pasos)**. Llama a `registrar_usuario_con_negocio()` al final del paso 3.

#### PASO 1 — Datos del propietario

| Campo | Tipo HTML | Validación Zod | Columna DB |
|---|---|---|---|
| Nombre completo | `input text` | `z.string().min(3).max(100)` | `perfiles.nombre_completo` |
| Teléfono | `input tel` | `z.string().min(7).max(20).optional()` | `perfiles.telefono` |

#### PASO 2 — Datos del negocio

| Campo | Tipo HTML | Validación Zod | Columna DB |
|---|---|---|---|
| Nombre del negocio | `input text` | `z.string().min(2).max(100)` | `configuracion.nombre_negocio` |
| Nombre legal/fiscal | `input text` | `z.string().min(2).max(200)` | `configuracion.nombre_completo` |
| País | `select` | `z.string().length(2)` | `configuracion.pais_codigo` |
| Tipo de negocio | `select` | `z.enum([...])` | `configuracion.tipo_negocio` |
| Teléfono negocio | `input tel` | `z.string().optional()` | `configuracion.telefono` |
| Dirección | `input text` | `z.string().optional()` | `configuracion.direccion` |

#### PASO 3 — Configuración fiscal

| Campo | Tipo HTML | Validación Zod | Columna DB |
|---|---|---|---|
| Moneda | `select` | `z.string().length(3)` | `configuracion.moneda_codigo` |
| RIF / NIT / RFC / CUIT | `input text` | `z.string().optional()` | `configuracion.rif_nit` |
| Porcentaje IVA/IVA | `input number` | `z.number().min(0).max(100)` | `impuestos_negocio` |

**Llamada a Supabase al finalizar:**
```js
const { data, error } = await supabase.rpc('registrar_usuario_con_negocio', {
  p_nombre_completo: paso1.nombre_completo,
  p_telefono_usuario: paso1.telefono,
  p_nombre_negocio: paso2.nombre_negocio,
  p_nombre_completo_negocio: paso2.nombre_legal,
  p_pais_codigo: paso2.pais,
  p_tipo_negocio: paso2.tipo_negocio,
  p_moneda_codigo: paso3.moneda,
  p_rif_nit: paso3.rif_nit,
  // ...otros campos
})
// Si ok → redirect a /dashboard
```

---

### 5.5 RECUPERACIÓN DE CONTRASEÑA

**`/forgot-password`**

| Campo | Tipo | Validación |
|---|---|---|
| Email | `input email` | `z.string().email()` |

```js
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/reset-password`
})
```

**`/reset-password`** (usuario llega desde el email)

| Campo | Tipo | Validación |
|---|---|---|
| Nueva contraseña | `input password` | `z.string().min(8)` |
| Confirmar contraseña | `input password` | `.refine(...)` |

```js
await supabase.auth.updateUser({ password: nuevaPassword })
// Redirect a /login
```

---

### 5.6 SETUP INICIAL — PRIMER SUPER ADMIN `/setup-inicial`

**Solo visible si `perfiles WHERE is_super_admin = TRUE` está vacío.**

| Campo | Tipo | Validación | Columna DB |
|---|---|---|---|
| Email | `input email` | `z.string().email()` | `auth.users.email` (ya debe existir) |
| Nombre completo | `input text` | `z.string().min(3)` | `perfiles.nombre_completo` |
| Notas | `textarea` | `z.string().optional()` | `perfiles.notas_admin` |
| Clave de setup | `input password` | `z.string().min(1)` | Se compara con `SETUP_INITIAL_SECRET` |

```js
// Verificar en el servidor que no hay super admins
const { count } = await supabase
  .from('perfiles')
  .select('*', { count: 'exact', head: true })
  .eq('is_super_admin', true)

if (count > 0) return redirect('/login') // Ya existe uno → pantalla no disponible

// Crear super admin
await supabase.rpc('registrar_super_admin_global', {
  p_email: email,
  p_nombre_completo: nombre,
  p_notas: notas
})
```

---

### 5.7 PANEL SUPER ADMIN — GESTIÓN DE SUPER ADMINS ADICIONALES

Ruta: `/superadmin/super-admins`

**Tabla de super admins existentes:**

| Columna | Campo DB |
|---|---|
| Nombre | `nombre_completo` |
| Email | JOIN `auth.users.email` |
| Activo | `activo` (HeroUI Chip/Badge) |
| Fecha creación | `created_at` |
| Acciones | Revocar permisos |

**Formulario para crear nuevo Super Admin:**
```js
await supabase.rpc('registrar_super_admin_global', {
  p_email: email,        // usuario ya registrado en auth
  p_nombre_completo: nombre,
  p_notas: notas
})
```

---

## 6. DASHBOARD ADMIN DEL NEGOCIO {#dashboard-admin}

**Acceso:** `perfiles.negocio_id IS NOT NULL` + `is_super_admin = FALSE`
**Plan:** Se muestra banner según `configuracion.plan_estado`

---

### SECCIÓN 1 — KPIs del negocio

Fuente: vistas `resumen_ventas_hoy`, `resumen_caja_actual`

| Tarjeta | Query / Vista | Ícono |
|---|---|---|
| Ventas hoy | `resumen_ventas_hoy.total_ventas` | `ShoppingCart` |
| Ingresos hoy | `resumen_ventas_hoy.monto_total` | `DollarSign` |
| Caja actual | `resumen_caja_actual.saldo_actual` | `Wallet` |
| Productos con stock bajo | `COUNT productos WHERE stock <= stock_minimo` | `AlertTriangle` |
| Fiados vencidos | `COUNT fiados WHERE estado='vencido'` | `Clock` |

---

### SECCIÓN 2 — Gráfico de ventas

Fuente: `ventas` agrupado por día/semana/mes (Recharts `LineChart` o `BarChart`)

- Filtro por rango: Hoy / Semana / Mes / Personalizado
- Muestra: monto total y número de ventas

---

### SECCIÓN 3 — Alertas

- **Stock bajo:** tabla de productos con `stock <= stock_minimo`
- **Fiados vencidos:** lista de clientes con deuda vencida
- **Plan vencido / por vencer:** `PlanVencidoBanner` condicional

---

### SIDEBAR ADMIN

| Sección | Ícono Lucide | Ruta |
|---|---|---|
| Dashboard | `LayoutDashboard` | `/dashboard` |
| Nueva Venta (POS) | `ShoppingCart` | `/ventas/nueva` |
| Historial Ventas | `Receipt` | `/ventas` |
| Productos | `Package` | `/productos` |
| Inventario | `Warehouse` | `/inventario` |
| Clientes | `Users` | `/clientes` |
| Fiados | `CreditCard` | `/fiados` |
| Caja | `Banknote` | `/caja` |
| Gastos | `TrendingDown` | `/gastos` |
| Devoluciones | `Undo2` | `/devoluciones` |
| Reportes | `BarChart2` | `/reportes` |
| Equipo | `UserCheck` | `/equipo` |
| Configuración | `Settings` | `/configuracion` |

---

## 7. DASHBOARD SUPER ADMIN GLOBAL {#dashboard-superadmin}

**Acceso:** `perfiles.is_super_admin = TRUE`
**Ve:** TODOS los negocios, sin restricción de plan (RLS lo permite)
**NO tiene:** `negocio_id`, no puede hacer operaciones de negocio

---

### SECCIÓN 1 — KPIs globales de la plataforma

Fuente: `configuracion` + `perfiles`

| Tarjeta | Query | Ícono |
|---|---|---|
| Total negocios | `COUNT(*) FROM configuracion` | `Store` |
| Negocios activos | `COUNT WHERE plan_estado = 'activo'` | `CheckCircle` |
| En prueba gratis | `COUNT WHERE plan_estado = 'prueba_gratis'` | `Clock` |
| Vencidos | `COUNT WHERE plan_estado = 'vencido'` | `AlertCircle` |
| Suspendidos | `COUNT WHERE plan_estado = 'suspendido'` | `XCircle` |
| Total usuarios | `COUNT FROM perfiles WHERE is_super_admin = FALSE` | `Users` |
| Super Admins | `COUNT FROM perfiles WHERE is_super_admin = TRUE` | `Shield` |
| Vencen esta semana | `COUNT WHERE plan_vencimiento <= NOW() + 7 days AND plan_estado = 'activo'` | `CalendarX` |

---

### SECCIÓN 2 — Tabla de negocios

Fuente: `configuracion` JOIN `perfiles` (owner_id)

| Columna | Campo DB | Notas |
|---|---|---|
| Negocio | `nombre_negocio` | |
| País | `pais_codigo` | Con ícono de bandera |
| Tipo | `tipo_negocio` | HeroUI Chip |
| Dueño | `perfiles.nombre_completo` (JOIN owner_id) | |
| Email dueño | `auth.users.email` (JOIN) | |
| Plan | `tipo_plan` | free / mensual / anual |
| Estado | `plan_estado` | HeroUI Chip de color |
| Vencimiento | `plan_vencimiento` | Con dias restantes |
| Registrado | `configuracion.created_at` | |
| Acciones | — | Ver / Activar / Suspender / Reactivar |

**Filtros disponibles:**
- Por `plan_estado`
- Por `pais_codigo`
- Por `tipo_negocio`
- Búsqueda por nombre

---

### SECCIÓN 3 — Drawer de gestión de un negocio

Al hacer click en un negocio, se abre un Modal/Drawer lateral con:

**Tab 1 — Información**
- Todos los campos de `configuracion`
- Datos del dueño (JOIN `perfiles`)
- Impuestos configurados (JOIN `impuestos_negocio`)
- Formato de factura (JOIN `facturas_formato`)

**Tab 2 — Gestión de Plan**

| Campo | Tipo | Función DB |
|---|---|---|
| Tipo de plan | `select` (`mensual` / `anual`) | `activar_plan_negocio(negocio_id, tipo_plan, dias)` |
| Días adicionales | `input number` (opcional) | Sobreescribe el default (30/365 días) |
| Botón Activar | — | Llama a `activar_plan_negocio()` |
| Botón Suspender | — | Llama a `gestionar_estado_negocio(id, 'suspender', motivo)` |
| Botón Reactivar | — | Llama a `gestionar_estado_negocio(id, 'reactivar', notas)` |
| Notas internas | `textarea` | `configuracion.notas_admin` |

**Tab 3 — Auditoría del negocio**
- Muestra `audit_logs` filtrado por `negocio_id`

---

### SECCIÓN 4 — Tabla de Super Admins

Fuente: `perfiles WHERE is_super_admin = TRUE`

| Columna | Campo DB |
|---|---|
| Nombre | `nombre_completo` |
| Email | JOIN `auth.users.email` |
| Activo | `activo` (HeroUI Chip) |
| Fecha creación | `created_at` |
| Acciones | Revocar permisos |

**Crear nuevo Super Admin:**
- Input email (el usuario ya debe existir)
- Input nombre completo
- Textarea notas
- Llama a `registrar_super_admin_global(email, nombre, notas)`

---

### SECCIÓN 5 — Auditoría global

Fuente: `audit_logs` (todos los negocios)

| Columna | Campo DB |
|---|---|
| Fecha | `created_at` |
| Negocio | JOIN `configuracion.nombre_negocio` via `negocio_id` |
| Tabla | `table_name` |
| Operación | `operation` (INSERT=verde / UPDATE=azul / DELETE=rojo) |
| Usuario | JOIN `perfiles.nombre_completo` via `changed_by` |
| Datos anteriores | `old_data` (JSONB expandible) |
| Datos nuevos | `new_data` (JSONB expandible) |

**Filtros:**
- Por negocio
- Por operación (INSERT/UPDATE/DELETE)
- Por tabla
- Por rango de fechas

---

### SECCIÓN 6 — Catálogos globales

Solo el Super Admin Global puede ver y editar:
- `catalogo_paises` — países disponibles
- `catalogo_monedas` — monedas del mundo
- `catalogo_tipos_impuesto` — tipos de impuesto globales
- `impuestos_pais` — tasas por país

---

### SIDEBAR SUPER ADMIN

| Sección | Ícono Lucide | Ruta |
|---|---|---|
| Dashboard Global | `Globe` | `/superadmin/dashboard` |
| Negocios | `Store` | `/superadmin/negocios` |
| Usuarios globales | `Users` | `/superadmin/usuarios` |
| Super Admins | `Shield` | `/superadmin/super-admins` |
| Gestión de Planes | `CreditCard` | `/superadmin/planes` |
| Auditoría Global | `ScrollText` | `/superadmin/auditoria` |
| Catálogos | `BookOpen` | `/superadmin/catalogos` |

---

## 8. VARIABLES DE ENTORNO {#env}

```env
# ─── Supabase (públicas, van al cliente) ──────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-publica

# ─── Supabase (privadas, NUNCA al cliente) ────────────────────────────────
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# ─── Setup inicial (para proteger /setup-inicial) ─────────────────────────
SETUP_INITIAL_SECRET=una-clave-muy-larga-y-aleatoria-aqui

# ─── App ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=POS V2
```

---

## 9. MIDDLEWARE DE PROTECCIÓN DE RUTAS {#middleware}

```js
// src/middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Crear cliente Supabase desde el middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { /* ...cookie handlers */ } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Rutas públicas: siempre permitir
  const publicRoutes = ['/login', '/register', '/verify-email',
    '/forgot-password', '/reset-password', '/setup-inicial']
  if (publicRoutes.some(r => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Sin sesión → login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Obtener perfil
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('is_super_admin, negocio_id, rol, activo')
    .eq('id', user.id)
    .single()

  // Perfil inactivo → logout
  if (!perfil?.activo) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Rutas de Super Admin → solo is_super_admin = TRUE
  if (pathname.startsWith('/superadmin')) {
    if (!perfil?.is_super_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // Rutas de admin del negocio → necesita negocio_id
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/ventas') ||
      pathname.startsWith('/productos') /* ... */) {
    if (!perfil?.negocio_id) {
      return NextResponse.redirect(new URL('/setup-negocio', request.url))
    }
    // Si es super admin global intentando entrar al admin del negocio → redirigir
    if (perfil?.is_super_admin) {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## ✅ ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. Configurar proyecto + Supabase + variables de entorno
2. Configurar HeroUI + Tailwind
3. Configurar middleware básico
4. **Login** → probar redirect según perfil
5. **Register** → verificar que trigger `handle_new_user` funciona
6. **Verify Email** → probar OTP y reenvío
7. **Setup Negocio** (3 pasos) → probar función `registrar_usuario_con_negocio()`
8. **Dashboard Admin** → KPIs, gráfico ventas, alertas
9. **Setup Inicial Super Admin** → probar `registrar_super_admin_global()`
10. **Dashboard Super Admin** → tabla de negocios, gestión de planes

---

*Versión 3.0 — Stack actualizado: HeroUI (reemplaza shadcn/ui) + JavaScript vanilla (sin TypeScript)*
*Análisis completo de: 01_database_structure.sql, 02_data_inserts.sql, 03_functions.sql, 04_triggers.sql, 05_permissions.sql, views.sql*
