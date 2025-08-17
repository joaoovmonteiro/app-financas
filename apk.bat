@echo off
setlocal enabledelayedexpansion
echo ========================================
echo    FINANCE APP - APK SIMPLES
echo ========================================
echo.
echo Usando seu Java JDK local configurado
echo.

REM Check Java
echo [1/4] Verificando Java...
where java >nul 2>&1 || (
    echo ERRO: Java nao encontrado
    echo Configure JAVA_HOME ou instale Java JDK
    pause
    exit /b 1
)
java -version
echo ✓ Java OK

echo.
echo [2/4] Construindo projeto web...
call npm run build
if !errorlevel! neq 0 (
    echo ERRO: Build falhou
    pause
    exit /b 1
)
echo ✓ Build OK

echo.
echo [3/4] Sincronizando Capacitor...
call npx cap sync android
if !errorlevel! neq 0 (
    echo ERRO: Sync falhou
    pause
    exit /b 1
)
echo ✓ Sync OK

echo.
echo [4/4] Gerando APK...
cd android

REM Try gradlew.bat (Windows) or gradlew (Unix)
if exist "gradlew.bat" (
    echo Usando gradlew.bat...
    call gradlew.bat assembleDebug
    set GRADLE_EXIT=!errorlevel!
) else (
    echo Usando gradlew...
    call gradlew assembleDebug
    set GRADLE_EXIT=!errorlevel!
)

cd ..

if !GRADLE_EXIT! neq 0 (
    echo.
    echo ERRO: Gradle falhou
    echo.
    echo SOLUÇÕES:
    echo 1. Configure ANDROID_HOME (Android SDK)
    echo 2. Ou use Android Studio:
    echo    - Abra: npx cap open android
    echo    - Build ^> Build APK
    echo.
    pause
    exit /b 1
)

echo.
echo Procurando APK...
set APK_FOUND=0

REM Check multiple possible locations
if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    copy "android\app\build\outputs\apk\debug\app-debug.apk" "FinanceApp-debug.apk" >nul
    set APK_FOUND=1
    set APK_LOCATION=android\app\build\outputs\apk\debug\
)

if exist "android\app\build\outputs\apk\app-debug.apk" (
    copy "android\app\build\outputs\apk\app-debug.apk" "FinanceApp-debug.apk" >nul
    set APK_FOUND=1
    set APK_LOCATION=android\app\build\outputs\apk\
)

if !APK_FOUND! equ 1 (
    echo.
    echo ========================================
    echo    APK GERADO COM SUCESSO!
    echo ========================================
    echo.
    echo ✓ APK: FinanceApp-debug.apk
    echo ✓ Pasta: %CD%
    echo ✓ Origem: !APK_LOCATION!
    echo.
    
    REM Show file size
    for %%A in ("FinanceApp-debug.apk") do (
        set SIZE=%%~zA
        set /A MB=!SIZE! / 1048576
        echo ✓ Tamanho: !MB! MB
    )
    
    echo.
    echo COMO INSTALAR NO ANDROID:
    echo 1. Transfira FinanceApp-debug.apk para o celular
    echo 2. Ative "Fontes desconhecidas" nas configurações
    echo 3. Toque no arquivo APK para instalar
    echo 4. Abra o app "Finance App"
    echo.
) else (
    echo.
    echo AVISO: APK nao encontrado nos locais esperados
    echo.
    echo Verificando estrutura de pastas...
    if exist "android\app\build\outputs" (
        dir android\app\build\outputs /S | findstr "apk"
    ) else (
        echo Pasta outputs nao existe - build pode ter falhado
    )
    echo.
    echo ALTERNATIVA - Use Android Studio:
    echo 1. Execute: npx cap open android
    echo 2. No Android Studio: Build ^> Build Bundle(s)/APK(s) ^> Build APK(s)
    echo.
)

echo.
echo Pressione qualquer tecla para sair...
pause >nul