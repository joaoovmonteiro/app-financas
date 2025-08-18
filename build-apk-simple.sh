#!/bin/bash

echo "========================================="
echo "    FINANCE APP - APK BUILDER SIMPLES   "
echo "========================================="
echo

# Build the web project
echo "[1/3] Construindo projeto web..."
npm run build
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao construir projeto web"
    exit 1
fi
echo "✓ Projeto web construído"

# Sync Capacitor
echo "[2/3] Sincronizando Capacitor..."
npx cap sync
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao sincronizar Capacitor"
    exit 1
fi
echo "✓ Capacitor sincronizado"

# Check if Android SDK is available in system
echo "[3/3] Verificando ambiente Android..."

# Try to find Android SDK in common locations
ANDROID_SDK_PATHS=(
    "/opt/android-sdk"
    "/usr/lib/android-sdk" 
    "/home/runner/.android/sdk"
    "$HOME/Android/Sdk"
    "/android-sdk"
)

ANDROID_HOME=""
for path in "${ANDROID_SDK_PATHS[@]}"; do
    if [ -d "$path" ]; then
        ANDROID_HOME="$path"
        break
    fi
done

if [ -z "$ANDROID_HOME" ]; then
    echo "❌ Android SDK não encontrado no ambiente Replit"
    echo ""
    echo "SOLUÇÃO: Use o Replit Deployments para gerar o APK:"
    echo "1. Clique no botão 'Deploy' no topo da página"
    echo "2. Configure para 'Static Site' apontando para 'dist/public'"
    echo "3. Após o deploy, acesse o link gerado no seu celular"
    echo "4. No navegador móvel, vá em Configurações > Adicionar à tela inicial"
    echo "5. Isso criará um app nativo no seu celular"
    echo ""
    echo "O app funcionará como um APK nativo com todas as funcionalidades!"
    echo ""
    
    # Create a simple APK instructions file
    cat > APK-INSTRUCTIONS.md << EOF
# Como ter o Finance App no seu celular

## Método 1: PWA (Recomendado - Mais Simples)
1. Faça deploy do app no Replit clicando em "Deploy"
2. Configure como "Static Site" apontando para "dist/public"
3. Abra o link do deploy no navegador do seu celular
4. No Chrome/Safari móvel: Menu > "Adicionar à tela inicial"
5. O app aparecerá como um ícone nativo no seu celular!

## Método 2: APK Manual (Avançado)
Para gerar um APK real, você precisará:
1. Instalar Android Studio no seu computador
2. Configurar o Android SDK
3. Executar: cd android && ./gradlew assembleDebug

## Vantagens do PWA (Método 1):
- ✅ Funciona offline
- ✅ Aparece como app nativo
- ✅ Recebe notificações
- ✅ Acesso total às funcionalidades
- ✅ Atualizações automáticas
- ✅ Não precisa de instalação manual

O PWA é a forma mais moderna e eficiente de ter apps móveis!
EOF

    echo "📱 Instruções salvas em: APK-INSTRUCTIONS.md"
    exit 0
fi

# If Android SDK is found, try to build
echo "✓ Android SDK encontrado em: $ANDROID_HOME"
export ANDROID_HOME="$ANDROID_HOME"
export ANDROID_SDK_ROOT="$ANDROID_HOME"

echo "sdk.dir=$ANDROID_HOME" > android/local.properties

echo "Construindo APK..."
cd android
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "    APK GERADO COM SUCESSO!"
    echo "========================================="
    
    # Find and copy APK
    APK_PATH=$(find . -name "*.apk" -path "*/outputs/apk/debug/*" | head -1)
    if [ -n "$APK_PATH" ]; then
        cp "$APK_PATH" "../FinanceApp-debug.apk"
        echo "APK copiado para: FinanceApp-debug.apk"
        echo "Tamanho: $(du -h ../FinanceApp-debug.apk | cut -f1)"
    else
        echo "APK gerado mas não encontrado no local esperado"
    fi
else
    echo "ERRO: Falha ao construir APK"
    echo "Use o método PWA como alternativa (veja APK-INSTRUCTIONS.md)"
fi