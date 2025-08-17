@echo off
setlocal enabledelayedexpansion
color 0A
echo ========================================
echo    FINANCE APP - APK BUILDER SIMPLES
echo ========================================
echo.
echo Esta versao usa Capacitor sem baixar Android SDK
echo Mais rapido, mas requer algumas configuracoes manuais
echo.

set PROJECT_NAME=FinanceApp
set PACKAGE_NAME=com.example.financeapp
set LOG_FILE=build-simple-log.txt

echo === BUILD SIMPLES - %DATE% %TIME% === > %LOG_FILE%

echo [1/4] Verificando Node.js...
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Node.js nao encontrado
    echo Instale Node.js de: https://nodejs.org
    pause
    exit /b 1
)
echo ✓ Node.js encontrado: 
node --version

echo.
echo [2/4] Instalando dependencias...
call npm install >> %LOG_FILE% 2>&1
call npm install @capacitor/core @capacitor/cli @capacitor/android >> %LOG_FILE% 2>&1
echo ✓ Dependencias instaladas

echo.
echo [3/4] Construindo projeto...
call npm run build >> %LOG_FILE% 2>&1
if !errorlevel! neq 0 (
    echo Tentando build alternativo...
    call npx vite build >> %LOG_FILE% 2>&1
    if !errorlevel! neq 0 (
        echo ERRO: Build falhou
        echo Verifique build-simple-log.txt
        pause
        exit /b 1
    )
)
echo ✓ Projeto construido

echo.
echo [4/4] Configurando Capacitor...

REM Update capacitor config
(
echo import { CapacitorConfig } from '@capacitor/cli';
echo.
echo const config: CapacitorConfig = {
echo   appId: '%PACKAGE_NAME%',
echo   appName: '%PROJECT_NAME%',
echo   webDir: 'dist/public',
echo   server: {
echo     androidScheme: 'https'
echo   }
echo };
echo.
echo export default config;
) > capacitor.config.ts

REM Initialize Capacitor
if not exist "capacitor.config.ts" (
    call npx cap init "%PROJECT_NAME%" "%PACKAGE_NAME%" >> %LOG_FILE% 2>&1
)

REM Add Android platform
if not exist "android" (
    call npx cap add android >> %LOG_FILE% 2>&1
)

REM Sync
call npx cap sync android >> %LOG_FILE% 2>&1

echo ✓ Capacitor configurado

echo.
echo ========================================
echo    CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo PROXIMOS PASSOS MANUAIS:
echo.
echo 1. Instale Android Studio de: https://developer.android.com/studio
echo 2. Configure Android SDK no Android Studio
echo 3. Execute este comando para abrir no Android Studio:
echo    npx cap open android
echo.
echo 4. No Android Studio:
echo    - Build ^> Build Bundle(s)/APK(s) ^> Build APK(s)
echo    - APK sera gerado em: android/app/build/outputs/apk/debug/
echo.
echo 5. Ou execute no terminal (se tiver Gradle configurado):
echo    cd android
echo    gradlew assembleDebug
echo.
echo ========================================
echo.
echo Pasta android/ foi criada com projeto nativo
echo Use Android Studio para gerar o APK final
echo.
echo Pressione qualquer tecla para sair...
pause >nul