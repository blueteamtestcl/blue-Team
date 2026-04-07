@echo off
echo =======================================================
echo BLUE TEAM DEFENSE CENTER - SETUP SCRIPT
echo =======================================================

echo.
echo Verificando dependencias del sistema...

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js no esta instalado.
    echo Por favor descarga e instala Node.js (v18 o superior) desde https://nodejs.org/
    echo Luego, vuelve a ejecutar este script.
    pause
    exit /b
)

echo [OK] Node.js detectado.

echo.
echo Instalando dependencias del Motor Principal (Dashboard)...
cd dashboard
call npm install
cd ..

echo.
echo Instalando dependencias de la Agencia Simulada (Pagina de Prueba)...
cd pagina_de_prueba
call npm install
cd ..

echo.
echo Creando archivo de variables de entorno si no existe...
if not exist "dashboard\.env.local" (
    echo GROQ_API_KEY=tu_clave_aqui > "dashboard\.env.local"
    echo [OK] Plantilla .env.local creada en carpeta dashboard.
)

echo.
echo =======================================================
echo Instalacion completada con exito.
echo Recuerda reemplazar "tu_clave_aqui" en dashboard/.env.local con tu API Key real de Groq.
echo Puedes iniciar el sistema ejecutando "start_all.bat".
echo =======================================================
pause
