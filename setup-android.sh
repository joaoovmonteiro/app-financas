#!/bin/bash

echo "========================================="
echo "  CONFIGURANDO ANDROID SDK COMPLETO     "
echo "========================================="

# Create tools directory
mkdir -p tools
cd tools

# Download Android Command Line Tools
echo "Baixando Android Command Line Tools..."
wget -q https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip -O android-tools.zip

if [ $? -ne 0 ]; then
    echo "Usando curl como alternativa..."
    curl -L "https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip" -o android-tools.zip
fi

# Extract tools
echo "Extraindo ferramentas..."
unzip -q android-tools.zip

# Create proper SDK structure
mkdir -p android-sdk/cmdline-tools
mv cmdline-tools android-sdk/cmdline-tools/latest

# Set environment variables
export ANDROID_HOME="$(pwd)/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "ANDROID_HOME=$ANDROID_HOME"

# Accept licenses
echo "Aceitando licenças..."
yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses

# Install required SDK components
echo "Instalando componentes SDK..."
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"

cd ..

# Update local.properties
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

echo "✓ Android SDK configurado com sucesso!"
echo "Pasta: $ANDROID_HOME"

# Export environment for current session
export ANDROID_HOME="$(pwd)/tools/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

echo "========================================="
echo "  GERANDO APK...                        "
echo "========================================="

# Build the project
echo "Construindo projeto..."
npm run build

# Sync Capacitor
echo "Sincronizando Capacitor..."
npx cap sync

# Build APK
echo "Construindo APK..."
cd android
./gradlew assembleDebug --no-daemon

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "    APK GERADO COM SUCESSO!            "
    echo "========================================="
    
    # Find APK
    APK_FILE=$(find . -name "app-debug.apk" | head -1)
    if [ -n "$APK_FILE" ]; then
        cp "$APK_FILE" "../FinanceApp-debug.apk"
        echo ""
        echo "APK salvo como: FinanceApp-debug.apk"
        echo "Tamanho: $(du -h ../FinanceApp-debug.apk | cut -f1)"
        echo ""
        echo "Para instalar no Android:"
        echo "1. Transfira o arquivo FinanceApp-debug.apk para seu celular"
        echo "2. Ative 'Fontes desconhecidas' nas configurações do Android"
        echo "3. Toque no arquivo APK para instalar"
        echo ""
    else
        echo "APK gerado mas arquivo não encontrado"
    fi
else
    echo "ERRO: Falha ao gerar APK"
fi