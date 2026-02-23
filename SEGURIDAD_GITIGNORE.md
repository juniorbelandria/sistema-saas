# 🔒 Seguridad del Repositorio - Archivos Protegidos

## ✅ Archivos CRÍTICOS Protegidos (NO se suben a Git)

### 🔐 Variables de Entorno
```
.env
.env.local
.env*.local
.env.development.local
.env.test.local
.env.production.local
.env.backup
```

**¿Por qué?** Contienen:
- Credenciales de Supabase (URL y API Keys)
- Service Role Key (acceso total a la base de datos)
- Códigos de Super Admin
- Configuraciones sensibles

**✅ PROTEGIDO:** Tus credenciales de Supabase están seguras

### 🔑 Certificados y Claves
```
*.pem
*.key
*.cert
*.crt
*.p12
*.pfx
```

**¿Por qué?** Son certificados SSL, claves privadas y credenciales de firma.

### 💾 Bases de Datos Locales
```
*.db
*.sqlite
*.sqlite3
```

**¿Por qué?** Pueden contener datos sensibles de prueba.

## 📁 Archivos de Desarrollo Protegidos

### Node Modules
```
/node_modules
```
**Tamaño:** Puede ser > 500MB
**Razón:** Se instalan con `npm install`

### Build y Cache
```
/.next/
/out/
/build
/dist
.cache/
.eslintcache
.turbo
```
**Razón:** Archivos generados automáticamente

### Logs
```
logs/
*.log
npm-debug.log*
yarn-debug.log*
```
**Razón:** Pueden contener información sensible

## 📝 Archivos SQL y Documentación

### Estado Actual: COMENTADOS (se suben)
```
# *.sql
# GUIA_*.md
# DEPLOY.md
# CONFIGURACION_*.md
```

**Archivos que SÍ se están subiendo:**
- `01_database_structure.sql`
- `02_data_inserts.sql`
- `03_functions.sql`
- `04_triggers.sql`
- `05_permissions.sql`
- `GUIA_POS_SETUP_V2 (1).md`
- `DEPLOY.md`
- `CONFIGURACION_SUPABASE_OTP.md`
- `GUIA_RAPIDA_OTP.md`
- `GUIA_REGISTRO_MULTITENANT.md`

### ⚠️ Recomendación de Seguridad

Si tus archivos SQL contienen:
- ❌ Datos de producción reales
- ❌ Credenciales hardcodeadas
- ❌ Información sensible de clientes

**DEBES descomentar estas líneas en .gitignore:**
```gitignore
*.sql
GUIA_*.md
DEPLOY.md
CONFIGURACION_*.md
```

Si solo contienen:
- ✅ Estructura de tablas
- ✅ Datos de ejemplo/catálogos
- ✅ Funciones y triggers
- ✅ Documentación técnica

**Está bien subirlos** (como está ahora)

## 🖥️ Archivos del Sistema Operativo

### Protegidos:
```
.DS_Store          # macOS
Thumbs.db          # Windows
desktop.ini        # Windows
._*                # macOS
```

## 🛠️ IDEs y Editores

### Protegidos:
```
.vscode/           # Visual Studio Code
.idea/             # JetBrains IDEs
*.swp, *.swo       # Vim
*.sublime-*        # Sublime Text
```

**Nota:** Si quieres compartir configuración de VSCode con tu equipo, crea `.vscode/settings.json` y agrégalo manualmente a Git.

## 🚀 Deployment

### Protegidos:
```
.vercel/
.netlify/
.firebase/
```

**Razón:** Configuraciones específicas de deployment que se regeneran.

## ✅ Verificación de Seguridad

### Comando para verificar qué archivos se subirían:
```bash
git status
```

### Comando para ver archivos ignorados:
```bash
git status --ignored
```

### Verificar que .env.local NO aparezca:
```bash
git check-ignore .env.local
# Debe retornar: .env.local
```

### Si accidentalmente agregaste .env.local:
```bash
# Removerlo del staging
git rm --cached .env.local

# Verificar que esté en .gitignore
cat .gitignore | grep .env.local
```

## 🔍 Archivos que SÍ deben subirse

### ✅ Código Fuente
- `src/**/*.js`
- `src/**/*.jsx`
- `src/**/*.css`

### ✅ Configuración del Proyecto
- `package.json`
- `package-lock.json`
- `next.config.mjs`
- `tailwind.config.js`
- `postcss.config.mjs`
- `eslint.config.mjs`

### ✅ Archivos de Ejemplo
- `.env.example` (sin credenciales reales)
- `README.md`
- `components.json`

### ✅ Assets Públicos
- `public/**/*` (imágenes, iconos, etc.)

### ✅ Documentación (opcional)
- `*.md` (excepto si contienen info sensible)

## 🚨 Qué Hacer si Subiste Algo Sensible

### 1. Si aún no hiciste push:
```bash
# Remover del último commit
git reset HEAD~1

# O remover archivo específico
git rm --cached archivo-sensible.txt
git commit --amend
```

### 2. Si ya hiciste push:
```bash
# PELIGRO: Reescribe el historial
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Forzar push (cuidado en equipos)
git push origin --force --all
```

### 3. Si subiste credenciales:
1. **ROTAR INMEDIATAMENTE** las credenciales en Supabase
2. Generar nuevas API Keys
3. Actualizar `.env.local` con las nuevas
4. Remover el archivo del historial de Git

## 📊 Resumen de Protección

| Categoría | Estado | Archivos |
|-----------|--------|----------|
| Variables de Entorno | ✅ PROTEGIDO | `.env.local` |
| Credenciales Supabase | ✅ PROTEGIDO | En `.env.local` |
| Service Role Key | ✅ PROTEGIDO | En `.env.local` |
| Node Modules | ✅ PROTEGIDO | `/node_modules` |
| Build Files | ✅ PROTEGIDO | `/.next/`, `/out/` |
| Certificados | ✅ PROTEGIDO | `*.pem`, `*.key` |
| Logs | ✅ PROTEGIDO | `*.log` |
| Archivos SQL | ⚠️ SE SUBEN | Revisar contenido |
| Documentación | ⚠️ SE SUBEN | Revisar contenido |

## 🎯 Recomendaciones Finales

### ✅ HACER:
1. Mantener `.env.local` siempre en `.gitignore`
2. Usar `.env.example` para documentar variables necesarias
3. Rotar credenciales si se exponen accidentalmente
4. Revisar `git status` antes de cada commit
5. Usar `.gitignore` global para archivos del sistema

### ❌ NO HACER:
1. Nunca hacer commit de `.env.local`
2. No hardcodear credenciales en el código
3. No subir bases de datos con datos reales
4. No compartir Service Role Key públicamente
5. No ignorar warnings de seguridad de Git

## 🔗 Enlaces Útiles

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [GitHub .gitignore Templates](https://github.com/github/gitignore)
- [Git Secrets Scanner](https://github.com/awslabs/git-secrets)

---

**Última actualización:** Sistema configurado con protección completa de credenciales.
**Estado:** ✅ Seguro para desarrollo y producción.
