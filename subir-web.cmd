@echo off
rem Doble clic para generar la web y subirla a internet (Cloudflare Pages).
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando dependencias por primera vez...
  call npm install || goto :error
)
call npm run subir || goto :error
echo.
pause
goto :eof
:error
echo.
echo Algo fallo. Copia el mensaje de arriba y pegaselo a Claude.
pause