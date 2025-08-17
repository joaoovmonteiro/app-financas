@echo off
setlocal enabledelayedexpansion
color 0A
echo ========================================
echo    FINANCE APP - APK BUILDER v2.0
echo ========================================
echo.
echo Iniciando processo de build...
echo Pasta atual: %CD%
echo Data/Hora: %DATE% %TIME%
echo.

REM Set variables
set JAVA_VERSION=17
set ANDROID_SDK_VERSION=34
set BUILD_TOOLS_VERSION=34.0.0
set PROJECT_NAME=FinanceApp
set PACKAGE_NAME=com.example.financeapp
set LOG_FILE=build-log.txt

REM Create log file
echo === BUILD LOG - %DATE% %TIME% === > %LOG_FILE%
echo Pasta do projeto: %CD% >> %LOG_FILE%

echo [1/8] Verificando Node.js...
echo [1/8] Verificando Node.js... >> %LOG_FILE%
where node >nul 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Node.js nao encontrado. 
    echo Baixe e instale Node.js de: https://nodejs.org
    echo ERRO: Node.js nao encontrado >> %LOG_FILE%
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)
echo ✓ Node.js encontrado
node --version
echo Node.js encontrado: >> %LOG_FILE%
node --version >> %LOG_FILE%

echo.
echo [2/8] Verificando/Instalando dependencias npm...
echo [2/8] Instalando dependencias npm... >> %LOG_FILE%
call npm install >> %LOG_FILE% 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Falha ao instalar dependencias npm
    echo Verifique o arquivo build-log.txt para detalhes
    echo ERRO npm install >> %LOG_FILE%
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)
echo ✓ Dependencias npm instaladas

echo.
echo [3/8] Instalando Capacitor...
echo [3/8] Instalando Capacitor... >> %LOG_FILE%
call npm install @capacitor/core @capacitor/cli @capacitor/android >> %LOG_FILE% 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Falha ao instalar Capacitor
    echo Verifique o arquivo build-log.txt para detalhes
    echo ERRO Capacitor install >> %LOG_FILE%
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)
echo ✓ Capacitor instalado

echo.
echo [4/8] Verificando Java JDK...
echo [4/8] Verificando Java JDK... >> %LOG_FILE%
where java >nul 2>&1
if !errorlevel! neq 0 (
    echo AVISO: Java nao encontrado no PATH
    echo Configurando Java JDK embarcado...
    echo Java nao encontrado, configurando JDK embarcado >> %LOG_FILE%
    
    REM Create tools directory
    if not exist "tools" mkdir tools
    cd tools
    
    REM Check if JDK already exists
    if not exist "jdk-17.0.2" (
        echo Baixando OpenJDK %JAVA_VERSION%... (pode demorar alguns minutos)
        powershell -Command "try { Invoke-WebRequest -Uri 'https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip' -OutFile 'openjdk17.zip' -UseBasicParsing } catch { Write-Host 'Erro no download: ' $_.Exception.Message; exit 1 }" >> ..\%LOG_FILE% 2>&1
        if !errorlevel! neq 0 (
            echo ERRO: Falha no download do JDK
            echo Verifique sua conexao com internet
            cd ..
            echo.
            echo Pressione qualquer tecla para sair...
            pause >nul
            exit /b 1
        )
        
        echo Extraindo JDK...
        powershell -Command "Expand-Archive -Path 'openjdk17.zip' -DestinationPath '.' -Force" >> ..\%LOG_FILE% 2>&1
    )
    
    REM Set JAVA_HOME
    for /d %%i in (jdk-17*) do (
        set JAVA_HOME=%CD%\%%i
        set PATH=!JAVA_HOME!\bin;!PATH!
    )
    
    cd ..
    echo JAVA_HOME configurado: !JAVA_HOME!
    echo JAVA_HOME: !JAVA_HOME! >> %LOG_FILE%
) else (
    echo ✓ Java encontrado
    java -version
    java -version >> %LOG_FILE% 2>&1
)

echo.
echo [5/8] Configurando Android SDK...
echo [5/8] Configurando Android SDK... >> %LOG_FILE%

REM Ensure tools directory exists
if not exist "tools" (
    echo Criando diretorio tools...
    mkdir tools
    echo Diretorio tools criado >> %LOG_FILE%
)

if not exist "tools\android-sdk" (
    echo Baixando Android SDK Command Line Tools...
    echo Baixando Android SDK... >> %LOG_FILE%
    
    pushd tools
    
    REM Download Android SDK Command Line Tools with better error handling
    powershell -Command "try { Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/commandlinetools-win-10406996_latest.zip' -OutFile 'android-sdk.zip' -UseBasicParsing; Write-Host 'Download concluido' } catch { Write-Host 'Erro no download:' $_.Exception.Message; exit 1 }" >> ..\%LOG_FILE% 2>&1
    
    if !errorlevel! neq 0 (
        echo ERRO: Falha no download do Android SDK
        echo Verifique sua conexao com internet
        echo Erro download Android SDK >> ..\%LOG_FILE%
        popd
        echo.
        echo Pressione qualquer tecla para sair...
        pause >nul
        exit /b 1
    )
    
    REM Create android-sdk directory
    if not exist "android-sdk" (
        mkdir android-sdk
        echo Diretorio android-sdk criado >> ..\%LOG_FILE%
    )
    
    REM Extract SDK
    echo Extraindo Android SDK...
    powershell -Command "try { Expand-Archive -Path 'android-sdk.zip' -DestinationPath 'android-sdk' -Force; Write-Host 'Extracao concluida' } catch { Write-Host 'Erro na extracao:' $_.Exception.Message; exit 1 }" >> ..\%LOG_FILE% 2>&1
    
    if !errorlevel! neq 0 (
        echo ERRO: Falha ao extrair Android SDK
        echo Erro extracao Android SDK >> ..\%LOG_FILE%
        popd
        echo.
        echo Pressione qualquer tecla para sair...
        pause >nul
        exit /b 1
    )
    
    REM Move cmdline-tools to correct location
    if exist "android-sdk\cmdline-tools" (
        if not exist "android-sdk\cmdline-tools\latest" (
            echo Reorganizando estrutura do SDK...
            move "android-sdk\cmdline-tools" "android-sdk\cmdline-tools-temp" >> ..\%LOG_FILE%
            mkdir "android-sdk\cmdline-tools\latest" >> ..\%LOG_FILE%
            move "android-sdk\cmdline-tools-temp\*" "android-sdk\cmdline-tools\latest\" >> ..\%LOG_FILE%
            rmdir "android-sdk\cmdline-tools-temp" >> ..\%LOG_FILE%
        )
    )
    
    popd
    echo ✓ Android SDK baixado e configurado
) else (
    echo ✓ Android SDK ja existe
)

REM Set Android environment variables
set ANDROID_HOME=%CD%\tools\android-sdk
set ANDROID_SDK_ROOT=%ANDROID_HOME%
set PATH=%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%PATH%

echo ANDROID_HOME: %ANDROID_HOME%
echo ANDROID_HOME configurado: %ANDROID_HOME% >> %LOG_FILE%

echo.
echo [6/8] Instalando componentes Android...
echo [6/8] Instalando componentes Android... >> %LOG_FILE%

if not exist "tools\android-sdk\platforms\android-%ANDROID_SDK_VERSION%" (
    echo Instalando Android Platform %ANDROID_SDK_VERSION% e Build Tools...
    echo Isso pode demorar alguns minutos...
    
    REM Accept licenses first
    echo y | call "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" --licenses >> %LOG_FILE% 2>&1
    
    REM Install required components
    call "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" "platforms;android-%ANDROID_SDK_VERSION%" "build-tools;%BUILD_TOOLS_VERSION%" "platform-tools" >> %LOG_FILE% 2>&1
    
    if !errorlevel! neq 0 (
        echo AVISO: Possivel erro na instalacao de componentes Android
        echo Continuando... alguns componentes podem ter sido instalados
        echo Aviso componentes Android >> %LOG_FILE%
    )
) else (
    echo ✓ Componentes Android ja instalados
)
echo ✓ Componentes Android configurados

echo.
echo [7/8] Construindo projeto web...
echo [7/8] Construindo projeto web... >> %LOG_FILE%

REM Check if build script exists
echo Verificando scripts npm...
call npm run build >> %LOG_FILE% 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Falha ao construir projeto web
    echo Tentando build alternativo...
    echo Build alternativo >> %LOG_FILE%
    
    REM Try alternative build
    call npx vite build >> %LOG_FILE% 2>&1
    if !errorlevel! neq 0 (
        echo ERRO: Build falhou completamente
        echo Verifique o arquivo build-log.txt para detalhes
        echo.
        echo Pressione qualquer tecla para sair...
        pause >nul
        exit /b 1
    )
)
echo ✓ Projeto web construido

REM Check if dist folder exists
if not exist "dist" (
    if exist "client\dist" (
        echo Copiando build do client...
        xcopy "client\dist" "dist" /E /I >> %LOG_FILE%
    ) else (
        echo ERRO: Pasta dist nao encontrada
        echo Build pode ter falhado
        echo.
        echo Pressione qualquer tecla para sair...
        pause >nul
        exit /b 1
    )
)

echo.
echo [8/8] Configurando Capacitor e gerando APK...

REM Initialize Capacitor if not done
if not exist "capacitor.config.ts" (
    echo Inicializando Capacitor...
    call npx cap init "%PROJECT_NAME%" "%PACKAGE_NAME%"
)

REM Add Android platform if not exists
if not exist "android" (
    echo Adicionando plataforma Android...
    call npx cap add android
)

REM Update capacitor config for correct build output
echo Atualizando configuracao Capacitor...
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

REM Sync with Android
echo Sincronizando com Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERRO: Falha ao sincronizar com Android
    pause
    exit /b 1
)

REM Build APK
echo Construindo APK...
echo Construindo APK... >> %LOG_FILE%
cd android

REM Set Android environment for gradlew
set ANDROID_HOME=%CD%\..\tools\android-sdk
set ANDROID_SDK_ROOT=%ANDROID_HOME%

echo Executando Gradle Build...
call gradlew.bat assembleDebug >> ..\%LOG_FILE% 2>&1
if !errorlevel! neq 0 (
    echo ERRO: Falha ao construir APK
    echo Verifique o arquivo build-log.txt para detalhes
    echo Erro Gradle build >> ..\%LOG_FILE%
    cd ..
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)
cd ..

echo Procurando APK gerado...
echo Procurando APK... >> %LOG_FILE%

REM Find APK in multiple possible locations
set APK_FOUND=0
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo APK encontrado em: android\app\build\outputs\apk\debug\
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "%PROJECT_NAME%-debug.apk" >> %LOG_FILE%
    set APK_FOUND=1
)

if exist "android\app\build\outputs\apk\app-debug.apk" (
    echo APK encontrado em: android\app\build\outputs\apk\
    copy "android\app\build\outputs\apk\app-debug.apk" "%PROJECT_NAME%-debug.apk" >> %LOG_FILE%
    set APK_FOUND=1
)

if !APK_FOUND! equ 1 (
    echo.
    echo ========================================
    echo    APK GERADO COM SUCESSO!
    echo ========================================
    echo.
    echo APK localizado em: %CD%\%PROJECT_NAME%-debug.apk
    echo.
    
    REM Show file size
    for %%A in ("%PROJECT_NAME%-debug.apk") do (
        set SIZE=%%~zA
        set /A MB=!SIZE! / 1048576
        echo Tamanho: !MB! MB
    )
    
    echo.
    echo Para instalar no Android:
    echo 1. Transfira o arquivo %PROJECT_NAME%-debug.apk para seu celular
    echo 2. Ative "Fontes desconhecidas" nas configuracoes do Android
    echo 3. Toque no arquivo APK para instalar
    echo 4. Abra o app "Finance App" 
    echo.
    echo APK salvo com sucesso em: >> %LOG_FILE%
    echo %CD%\%PROJECT_NAME%-debug.apk >> %LOG_FILE%
) else (
    echo ERRO: APK nao foi encontrado
    echo Verificando estrutura de pastas...
    dir android\app\build\outputs /S >> %LOG_FILE%
    echo APK nao encontrado >> %LOG_FILE%
    echo.
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

echo.
echo ========================================
echo PROCESSO CONCLUIDO COM SUCESSO!
echo ========================================
echo.
echo Arquivos gerados:
echo - %PROJECT_NAME%-debug.apk (APK para Android)
echo - build-log.txt (Log detalhado do processo)
echo.
echo O APK esta pronto para instalacao no Android!
echo.
echo === BUILD CONCLUIDO - %DATE% %TIME% === >> %LOG_FILE%
echo.
echo Pressione qualquer tecla para sair...
pause >nul