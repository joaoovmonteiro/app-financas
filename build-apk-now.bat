#!/bin/bash

echo "========================================="
echo "  GERANDO APK DO FINANCE APP - VERSÃO 2 "
echo "========================================="

# Ensure we have the environment
export ANDROID_HOME="$(pwd)/tools/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# Clean and build web
echo "[1/4] Limpando e construindo web..."
npm run build

# Sync capacitor
echo "[2/4] Sincronizando Capacitor..."
npx cap sync

# Clean android build
echo "[3/4] Limpando build anterior..."
cd android
./gradlew clean --no-daemon

# Build APK
echo "[4/4] Construindo APK..."
./gradlew assembleDebug --no-daemon --stacktrace

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "  🎉 APK GERADO COM SUCESSO! 🎉        "
    echo "========================================="
    
    # Find and copy APK
    APK_FILE=$(find . -name "app-debug.apk" -path "*/outputs/apk/debug/*" | head -1)
    if [ -n "$APK_FILE" ]; then
        cp "$APK_FILE" "../FinanceApp-debug.apk"
        echo ""
        echo "📱 APK PRONTO: FinanceApp-debug.apk"
        echo "📏 Tamanho: $(du -h ../FinanceApp-debug.apk | cut -f1)"
        echo ""
        echo "🚀 COMO INSTALAR:"
        echo "1. Transfira FinanceApp-debug.apk para seu Android"
        echo "2. Ative 'Instalar apps desconhecidas' nas configurações"
        echo "3. Toque no arquivo APK para instalar"
        echo "4. Aproveite seu app financeiro!"
        echo ""
        echo "✨ FUNCIONALIDADES DO APP:"
        echo "- Dashboard com saldo e transações"
        echo "- Criar categorias personalizadas"
        echo "- Adicionar receitas e despesas"
        echo "- Gasto diário sugerido"
        echo "- Interface dark mode"
        echo "- Navegação móvel otimizada"
        echo ""
    else
        echo "❌ APK gerado mas não encontrado"
        echo "Procurar manualmente em android/app/build/outputs/apk/debug/"
    fi
else
    echo ""
    echo "❌ ERRO: Falha ao gerar APK"
    echo "Verificar logs acima para detalhes"
fi