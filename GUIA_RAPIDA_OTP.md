# Guía Rápida - Sistema de Autenticación con OTP

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Configurar Supabase
Sigue las instrucciones en `CONFIGURACION_SUPABASE_OTP.md` para:
- Configurar templates de email
- Habilitar Email OTP
- Configurar URLs de redirección

### 4. Iniciar Servidor
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📋 Flujos Implementados

### ✅ Registro de Negocio
1. **Página:** `/register`
2. **Flujo:**
   - Usuario completa 4 pasos del formulario
   - Al finalizar, se ejecuta `supabase.auth.signUp()`
   - Toast: "Código enviado a tu correo"
   - Redirección automática a `/verify-email?email=X&type=signup`

### ✅ Verificación de Email (Registro)
1. **Página:** `/verify-email?type=signup`
2. **UI:** 8 inputs individuales con letter-spacing amplio
3. **Flujo:**
   - Usuario ingresa código de 8 dígitos
   - Se ejecuta `supabase.auth.verifyOtp({ type: 'signup' })`
   - Si éxito → Redirección a `/admin/dashboard`
   - Botón "Reenviar código" con contador de 60 segundos

### ✅ Recuperación de Contraseña
1. **Página:** `/forgot-password`
2. **Flujo:**
   - Usuario ingresa email
   - Se ejecuta `supabase.auth.resetPasswordForEmail()`
   - Toast: "Código de seguridad enviado"
   - Redirección a `/verify-email?email=X&type=recovery`

### ✅ Verificación de Email (Recuperación)
1. **Página:** `/verify-email?type=recovery`
2. **UI:** 8 inputs con color Warning (naranja)
3. **Flujo:**
   - Usuario ingresa código de 8 dígitos
   - Se ejecuta `supabase.auth.verifyOtp({ type: 'recovery' })`
   - Supabase crea sesión automática
   - Redirección a `/reset-password`

### ✅ Cambio de Contraseña
1. **Página:** `/reset-password`
2. **Seguridad:** Verifica sesión activa (creada por OTP recovery)
3. **Flujo:**
   - Usuario ingresa nueva contraseña
   - Se ejecuta `supabase.auth.updateUser({ password })`
   - Toast: "Contraseña actualizada, ya puedes iniciar sesión"
   - Cierre de sesión automático
   - Redirección a `/login`

## 🎨 Características de UX

### Colores Temáticos
- **Signup:** Color Primary (azul)
- **Recovery:** Color Warning (naranja)

### Estados de Carga
Todos los botones usan `isLoading` de Hero UI:
```jsx
<Button isLoading={isLoading}>
  {isLoading ? 'Cargando...' : 'Texto normal'}
</Button>
```

### Notificaciones con Sonner
```jsx
import { toast } from 'sonner';

// Éxito
toast.success('Código enviado a tu correo');

// Error
toast.error('Código inválido o expirado');
```

### Input de OTP
- 8 dígitos individuales
- Letter-spacing amplio
- Auto-focus entre inputs
- Soporte para pegar código completo
- Backspace navega al input anterior

### Botón de Reenvío
- Contador de 60 segundos
- Deshabilitado durante el countdown
- Texto dinámico: "Podrás reenviar en X segundos"

## 🔧 Archivos Modificados/Creados

### Nuevos Archivos
- `src/lib/supabase.js` - Cliente de Supabase
- `CONFIGURACION_SUPABASE_OTP.md` - Guía de configuración completa
- `GUIA_RAPIDA_OTP.md` - Esta guía

### Archivos Actualizados
- `src/app/(auth)/register/page.js` - Integración con signUp
- `src/app/(auth)/forgot-password/page.js` - Integración con resetPasswordForEmail
- `src/app/(auth)/verify-email/page.js` - Reescrito completamente para OTP de 8 dígitos
- `src/app/(auth)/reset-password/page.js` - Reescrito con validación de sesión

## 📦 Dependencias Utilizadas

Ya instaladas en tu proyecto:
- `@supabase/supabase-js` - Cliente de Supabase
- `@heroui/react` - Componentes UI
- `sonner` - Sistema de notificaciones
- `next` - Framework React
- `lucide-react` - Iconos

## 🧪 Testing Manual

### Test 1: Registro Completo
```
1. Ir a /register
2. Completar los 4 pasos
3. Verificar toast "Código enviado a tu correo"
4. Revisar email (código de 8 dígitos)
5. Ingresar código en /verify-email
6. Verificar redirección a /admin/dashboard
```

### Test 2: Recuperación de Contraseña
```
1. Ir a /forgot-password
2. Ingresar email registrado
3. Verificar toast "Código de seguridad enviado"
4. Revisar email (código de 8 dígitos)
5. Ingresar código en /verify-email
6. Verificar redirección a /reset-password
7. Ingresar nueva contraseña
8. Verificar toast "Contraseña actualizada"
9. Verificar redirección a /login
```

### Test 3: Reenvío de Código
```
1. En /verify-email, esperar 60 segundos
2. Hacer clic en "Reenviar código"
3. Verificar nuevo email con código
4. Verificar contador reiniciado a 60 segundos
```

### Test 4: Código Inválido
```
1. En /verify-email, ingresar código incorrecto
2. Verificar toast de error
3. Verificar que los inputs se mantienen editables
```

## 🔐 Seguridad Implementada

✅ Códigos OTP de un solo uso
✅ Expiración automática (1 hora recovery, 24 horas signup)
✅ Validación de sesión en reset-password
✅ Cierre de sesión después de cambiar contraseña
✅ Metadata del usuario encriptada en Supabase
✅ Contraseñas hasheadas con bcrypt

## 📱 Responsive Design

Todas las páginas son completamente responsive:
- Mobile: Inputs de OTP más pequeños (w-10 h-12)
- Desktop: Inputs más grandes (w-12 h-14)
- Columna izquierda de branding oculta en mobile
- Layout de 2 columnas en desktop

## 🎯 Próximos Pasos

1. Configurar Supabase según `CONFIGURACION_SUPABASE_OTP.md`
2. Probar el flujo completo de registro
3. Probar el flujo de recuperación de contraseña
4. Personalizar los templates de email en Supabase
5. Configurar dominio personalizado para emails
6. Implementar la tabla `business_profiles` (opcional)

## 💡 Tips

- Los códigos OTP se envían por email, revisa spam si no llegan
- El contador de 60 segundos previene spam de reenvíos
- Los colores Primary/Warning ayudan a diferenciar los flujos
- La sesión se crea automáticamente al verificar OTP de recovery
- Puedes personalizar los templates de email en Supabase Dashboard

## 🐛 Solución de Problemas

### No llegan los emails
- Verifica las variables de entorno
- Revisa la carpeta de spam
- Verifica que Email Auth esté habilitado en Supabase
- Revisa los logs en Supabase Dashboard

### Error "Invalid OTP"
- El código puede haber expirado
- Verifica que sean exactamente 8 dígitos
- Usa el botón "Reenviar código"

### Error en reset-password
- Debes verificar el OTP antes de acceder
- La sesión se crea al verificar el OTP de tipo 'recovery'

## 📞 Soporte

Para más información, consulta:
- `CONFIGURACION_SUPABASE_OTP.md` - Configuración detallada
- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth)
- [Documentación de Hero UI](https://heroui.com)
