#!/bin/bash
set -e

echo "==========================================="
echo "    FINANCE APP - GERADOR APK RÁPIDO     "
echo "==========================================="

# 1. Build do projeto
echo "[1/4] 🔨 Construindo projeto web..."
npm run build
echo "✓ Projeto web construído"

# 2. Sync Capacitor
echo "[2/4] 📱 Sincronizando Capacitor..."
npx cap sync android
echo "✓ Capacitor sincronizado"

# 3. Configurar gradle (otimizado)
echo "[3/4] ⚙️  Configurando build Android..."
cd android
chmod +x gradlew

# Configurar propriedades do gradle para build mais rápido
cat > gradle.properties << EOF
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
org.gradle.parallel=true
org.gradle.caching=true
org.gradle.daemon=true
android.useAndroidX=true
android.enableJetifier=true
EOF

echo "✓ Configuração otimizada"

# 4. Build APK (versão otimizada)
echo "[4/4] 📦 Gerando APK..."
echo "⏳ Isso pode levar alguns minutos..."

# Build apenas o essencial
./gradlew assembleDebug --no-daemon --parallel --max-workers=2 > build.log 2>&1 &
BUILD_PID=$!

# Monitor do progresso
echo "🔄 Build em andamento (PID: $BUILD_PID)..."
echo "📊 Acompanhe o progresso em android/build.log"

# Aguarda o build
wait $BUILD_PID

if [ $? -eq 0 ]; then
    echo ""
    echo "==========================================="
    echo "🎉 APK GERADO COM SUCESSO!"
    echo "==========================================="
    echo ""
    
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "$APK_PATH" ]; then
        APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
        echo "📱 APK: $APK_PATH"
        echo "📏 Tamanho: $APK_SIZE"
        echo ""
        echo "✅ Para instalar:"
        echo "   1. Baixe o arquivo: android/$APK_PATH"
        echo "   2. Transfira para seu celular"
        echo "   3. Ative 'Fontes desconhecidas' nas configurações"
        echo "   4. Toque no arquivo APK para instalar"
        echo ""
        echo "🚀 Seu Finance App está pronto!"
    else
        echo "❌ APK não encontrado em $APK_PATH"
        echo "📋 Verifique o log: android/build.log"
    fi
else
    echo ""
    echo "❌ ERRO no build do APK"
    echo "📋 Detalhes do erro em: android/build.log"
    echo ""
    tail -20 build.log
fi

cd ..
echo "==========================================="