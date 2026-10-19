@echo off
rem Doble clic para ver el sitio en el navegador (con borradores y recarga automatica).
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias por primera vez...
  call npm install || goto :error
)
call npm run dev
goto :eof
:error
echo.
echo No se pudo instalar. Comprueba que Node.js este instalado: https://nodejs.org
pause