@echo off
echo ========================================
echo VERIFICACION DE SEGURIDAD - GIT
echo ========================================
echo.

echo [1/5] Verificando archivos .env...
git ls-files | findstr "\.env\.local" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] .env.local esta en el repositorio!
    echo Ejecuta: git rm --cached .env.local
) else (
    echo [OK] .env.local NO esta en el repositorio
)
echo.

echo [2/5] Verificando que .env.local este ignorado...
git check-ignore .env.local >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] .env.local esta en .gitignore
) else (
    echo [ERROR] .env.local NO esta en .gitignore!
)
echo.

echo [3/5] Verificando archivos sensibles...
git ls-files | findstr "\.pem \.key \.cert" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] Hay certificados en el repositorio!
) else (
    echo [OK] No hay certificados en el repositorio
)
echo.

echo [4/5] Verificando node_modules...
git ls-files | findstr "node_modules" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] node_modules esta en el repositorio!
) else (
    echo [OK] node_modules NO esta en el repositorio
)
echo.

echo [5/5] Verificando archivos .next...
git ls-files | findstr "\.next" >nul 2>&1
if %errorlevel% equ 0 (
    echo [ERROR] .next esta en el repositorio!
) else (
    echo [OK] .next NO esta en el repositorio
)
echo.

echo ========================================
echo VERIFICACION COMPLETADA
echo ========================================
echo.
echo Archivos que SI deben estar:
git ls-files | findstr "\.env\.example"
echo.
echo Para ver todos los archivos ignorados:
echo git status --ignored
echo.
pause
