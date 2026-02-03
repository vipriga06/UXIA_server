#!/bin/bash
# proxmoxRun-simple.sh

source ./proxmox/config.env

USER=${1:-$DEFAULT_USER}
RSA_PATH=${2:-$DEFAULT_RSA_PATH}
PORT=${3:-$DEFAULT_SERVER_PORT}

echo "🚀 Desplegando en puerto $PORT..."

# 1. Conectar SSH y enviar archivos
ssh -p 20127 -oHostKeyAlgorithms=+ssh-rsa "$USER@ieticloudpro.ieti.cat" "
    # Crear directorio si no existe
    mkdir -p ~/uxia-server
    
    # Entrar al directorio
    cd ~/uxia-server
    
    # Detener servidor anterior (si existe)
    if [ -f server.pid ]; then
        kill \$(cat server.pid) 2>/dev/null || true
    fi
    
    # Matar cualquier proceso node de nuestra app
    pkill -f 'node.*server.js' 2>/dev/null || true
"

# 2. Enviar SOLO los archivos esenciales
scp -P 20127 -oHostKeyAlgorithms=+ssh-rsa \
    package.json \
    server.js \
    .env \
    "$USER@ieticloudpro.ieti.cat:~/uxia-server/"

# 3. Enviar carpeta src completa
scp -P 20127 -r -oHostKeyAlgorithms=+ssh-rsa \
    src \
    "$USER@ieticloudpro.ieti.cat:~/uxia-server/"

# 4. Ejecutar despliegue
ssh -p 20127 -oHostKeyAlgorithms=+ssh-rsa "$USER@ieticloudpro.ieti.cat" "
    cd ~/uxia-server
    
    echo '📦 Instalando dependencias...'
    npm install --omit=dev
    
    echo '🚀 Iniciando servidor...'
    nohup node server.js > server.log 2>&1 &
    echo \$! > server.pid
    
    sleep 3
    
    echo '✅ Desplegado. Verifica:'
    echo '   curl http://localhost:$PORT/health'
    echo '   tail -5 server.log'
    
    echo ''
    echo '🌐 URL: http://ieticloudpro.ieti.cat:$PORT'
"