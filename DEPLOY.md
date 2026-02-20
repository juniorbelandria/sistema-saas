# 🚀 Guía de Despliegue en Netlify

## 📋 Requisitos Previos

1. Cuenta en [Netlify](https://www.netlify.com/)
2. Cuenta en [Supabase](https://supabase.com/)
3. Repositorio Git (GitHub, GitLab o Bitbucket)

## 🔧 Pasos para Desplegar

### 1. Preparar el Proyecto

```bash
# Asegúrate de estar en la carpeta del proyecto
cd pos-sistema

# Instala las dependencias
npm install

# Prueba el build localmente
npm run build
```

### 2. Subir a Git

```bash
# Inicializa git (si no lo has hecho)
git init

# Agrega todos los archivos
git add .

# Haz commit
git commit -m "Initial commit - Sistema POS"

# Conecta con tu repositorio remoto
git remote add origin https://github.com/tu-usuario/tu-repo.git

# Sube los cambios
git push -u origin main
```

### 3. Configurar en Netlify

1. Ve a [Netlify](https://app.netlify.com/)
2. Click en "Add new site" > "Import an existing project"
3. Conecta tu repositorio de Git
4. Configura el build:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
   - **Base directory:** `pos-sistema` (si tu proyecto está en una subcarpeta)

### 4. Variables de Entorno en Netlify

Ve a: **Site settings > Environment variables** y agrega:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
NEXT_PUBLIC_APP_URL=https://tu-sitio.netlify.app
NEXT_PUBLIC_APP_NAME=Sistema POS
```

### 5. Instalar Plugin de Next.js

Netlify debería detectar automáticamente que es un proyecto Next.js e instalar el plugin `@netlify/plugin-nextjs`.

Si no lo hace automáticamente:
1. Ve a **Site settings > Build & deploy > Build plugins**
2. Busca e instala "@netlify/plugin-nextjs"

### 6. Deploy

Click en "Deploy site" y espera a que termine el build.

## ✅ Verificación

Una vez desplegado, verifica:

- [ ] La página de login carga correctamente
- [ ] El tema claro/oscuro funciona
- [ ] Los modales se abren con blur
- [ ] La página de registro funciona
- [ ] Las imágenes cargan correctamente

## 🔄 Actualizaciones Automáticas

Netlify está configurado para hacer deploy automático cada vez que hagas push a la rama `main`:

```bash
git add .
git commit -m "Descripción de cambios"
git push
```

## 🐛 Solución de Problemas

### Error: "Module not found"
```bash
# Limpia node_modules y reinstala
rm -rf node_modules package-lock.json
npm install
```

### Error: "Build failed"
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs de build en Netlify
- Asegúrate de que `npm run build` funcione localmente

### Imágenes no cargan
- Verifica que las rutas sean relativas: `/assets/imagenes/logo.webp`
- Asegúrate de que las imágenes estén en la carpeta `public/`

## 📚 Recursos

- [Documentación de Netlify](https://docs.netlify.com/)
- [Next.js en Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Supabase Docs](https://supabase.com/docs)

## 🆘 Soporte

Si tienes problemas, revisa:
1. Los logs de build en Netlify
2. La consola del navegador (F12)
3. Las variables de entorno están correctamente configuradas
