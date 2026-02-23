# Configuración de Supabase para OTP de 8 Dígitos

## 1. Configuración del Proyecto Supabase

### Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

## 2. Configuración de Email Templates en Supabase

Ve a tu proyecto en Supabase Dashboard → Authentication → Email Templates

### Template: Confirm Signup (Verificación de Registro)

**Subject:** `Verifica tu cuenta - Sistema POS`

**Body:**
```html
<h2>¡Bienvenido a Sistema POS!</h2>
<p>Gracias por registrarte. Para activar tu cuenta, ingresa el siguiente código de verificación:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #0070f3;">{{ .Token }}</h1>
<p>Este código expira en 24 horas.</p>
<p>Si no solicitaste este registro, puedes ignorar este correo.</p>
```

### Template: Magic Link (Recuperación de Contraseña)

**Subject:** `Recupera tu contraseña - Sistema POS`

**Body:**
```html
<h2>Recuperación de Contraseña</h2>
<p>Recibimos una solicitud para restablecer tu contraseña. Ingresa el siguiente código de seguridad:</p>
<h1 style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #f59e0b;">{{ .Token }}</h1>
<p>Este código expira en 1 hora.</p>
<p>Si no solicitaste este cambio, ignora este correo y tu contraseña permanecerá sin cambios.</p>
```

## 3. Configuración de Auth Settings

En Supabase Dashboard → Authentication → Settings:

### Email Auth
- ✅ Enable Email Confirmations
- ✅ Enable Email OTP
- ✅ Secure Email Change

### OTP Settings
- **OTP Expiry:** 3600 segundos (1 hora para recovery, 24 horas para signup)
- **OTP Length:** 8 dígitos (configurar en Auth Settings)

### URL Configuration
- **Site URL:** `http://localhost:3000` (desarrollo) o tu dominio en producción
- **Redirect URLs:** 
  - `http://localhost:3000/verify-email`
  - `http://localhost:3000/reset-password`
  - `http://localhost:3000/admin/dashboard`

## 4. Configuración de la Base de Datos

### Tabla de Usuarios Extendida (Opcional)

Si quieres almacenar información adicional del negocio:

```sql
-- Crear tabla de perfiles de negocio
CREATE TABLE public.business_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  nombre_completo TEXT,
  telefono TEXT,
  nombre_negocio TEXT NOT NULL,
  nombre_legal TEXT NOT NULL,
  pais TEXT NOT NULL,
  tipo_negocio TEXT NOT NULL,
  telefono_negocio TEXT,
  direccion TEXT,
  rif_nit TEXT,
  tasa_impuesto NUMERIC,
  moneda TEXT NOT NULL,
  simbolo_moneda TEXT NOT NULL,
  tipo_impuesto TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile"
  ON public.business_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.business_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.business_profiles (
    id,
    nombre_completo,
    telefono,
    nombre_negocio,
    nombre_legal,
    pais,
    tipo_negocio,
    telefono_negocio,
    direccion,
    rif_nit,
    tasa_impuesto,
    moneda,
    simbolo_moneda,
    tipo_impuesto
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nombre_completo',
    NEW.raw_user_meta_data->>'telefono',
    NEW.raw_user_meta_data->>'nombre_negocio',
    NEW.raw_user_meta_data->>'nombre_legal',
    NEW.raw_user_meta_data->>'pais',
    NEW.raw_user_meta_data->>'tipo_negocio',
    NEW.raw_user_meta_data->>'telefono_negocio',
    NEW.raw_user_meta_data->>'direccion',
    NEW.raw_user_meta_data->>'rif_nit',
    (NEW.raw_user_meta_data->>'tasa_impuesto')::NUMERIC,
    NEW.raw_user_meta_data->>'moneda',
    NEW.raw_user_meta_data->>'simbolo_moneda',
    NEW.raw_user_meta_data->>'tipo_impuesto'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

## 5. Flujo de Autenticación Implementado

### Registro (Signup)
1. Usuario completa formulario de registro
2. `supabase.auth.signUp()` envía OTP de 8 dígitos al email
3. Redirección a `/verify-email?email=X&type=signup`
4. Usuario ingresa código de 8 dígitos
5. `supabase.auth.verifyOtp()` con `type: 'signup'`
6. Si éxito → Redirección a `/admin/dashboard`

### Recuperación de Contraseña
1. Usuario ingresa email en `/forgot-password`
2. `supabase.auth.resetPasswordForEmail()` envía OTP
3. Redirección a `/verify-email?email=X&type=recovery`
4. Usuario ingresa código de 8 dígitos
5. `supabase.auth.verifyOtp()` con `type: 'recovery'`
6. Supabase crea sesión automática
7. Redirección a `/reset-password`
8. Usuario ingresa nueva contraseña
9. `supabase.auth.updateUser({ password })` actualiza contraseña
10. Cierre de sesión y redirección a `/login`

## 6. Características Implementadas

✅ OTP de 8 dígitos con letter-spacing amplio
✅ Inputs individuales para cada dígito
✅ Auto-focus entre inputs
✅ Soporte para pegar código completo
✅ Botón de reenvío con contador de 60 segundos
✅ Notificaciones con Sonner (toast)
✅ Estados de carga con Hero UI `isLoading`
✅ Colores diferenciados: Primary (signup) / Warning (recovery)
✅ Validación de sesión en reset-password
✅ Metadata del usuario almacenada en signUp

## 7. Testing

### Probar Registro
```bash
# 1. Iniciar servidor de desarrollo
npm run dev

# 2. Ir a http://localhost:3000/register
# 3. Completar formulario
# 4. Verificar email recibido con código de 8 dígitos
# 5. Ingresar código en /verify-email
```

### Probar Recuperación
```bash
# 1. Ir a http://localhost:3000/forgot-password
# 2. Ingresar email registrado
# 3. Verificar email con código de 8 dígitos
# 4. Ingresar código en /verify-email
# 5. Cambiar contraseña en /reset-password
```

## 8. Troubleshooting

### El código no llega al email
- Verifica que el email esté confirmado en Supabase
- Revisa la carpeta de spam
- Verifica que Email Auth esté habilitado
- Revisa los logs en Supabase Dashboard → Logs

### Error "Invalid OTP"
- El código expira después de 1 hora (recovery) o 24 horas (signup)
- Verifica que el código sea exactamente 8 dígitos
- Usa el botón "Reenviar código" para obtener uno nuevo

### Sesión inválida en reset-password
- Asegúrate de verificar el OTP antes de acceder a reset-password
- La sesión se crea automáticamente al verificar el OTP de tipo 'recovery'

## 9. Seguridad

- Los códigos OTP son de un solo uso
- Los códigos expiran automáticamente
- Las contraseñas se almacenan con hash bcrypt
- RLS (Row Level Security) protege los datos de usuario
- HTTPS requerido en producción
