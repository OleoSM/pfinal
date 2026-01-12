@echo off
echo ============================================
echo  GymWear Shop - Desarrollo Local
echo ============================================
echo.

echo [1/4] Iniciando PostgreSQL con Docker...
docker-compose up -d db
timeout /t 5 /nobreak >nul

echo.
echo [2/4] Instalando dependencias del frontend...
cd app\frontend
call npm install
cd ..\..

echo.
echo [3/4] Iniciando Backend (Spring Boot)...
echo      Abre otra terminal para el frontend
echo.
start "Frontend Angular" cmd /k "cd /d %~dp0app\frontend && npm start"

echo.
echo [4/4] Iniciando Backend...
cd app
call .\mvnw spring-boot:run

pause
