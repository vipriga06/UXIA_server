#!/bin/bash

source ./config.env

USER=${1:-$DEFAULT_USER}
RSA_PATH=${2:-$DEFAULT_RSA_PATH}
SERVER_PORT=${3:-$DEFAULT_SERVER_PORT}
SSH_OPTS='-oHostKeyAlgorithms=+ssh-rsa -oPubkeyAcceptedAlgorithms=+ssh-rsa'

echo "User: $USER"
echo "Ruta RSA: $RSA_PATH"
echo "Server port: $SERVER_PORT"

PROJECT_PATH="./"

cd "$PROJECT_PATH"

if [[ ! -f "$RSA_PATH" ]]; then
    echo "Error: No se ha encontrado el archivo de clave privada: $RSA_PATH"
    exit 1
fi

echo "=== DESPLIEGUE DIRECTO ==="

eval "$(ssh-agent -s)"
ssh-add "$RSA_PATH"
if [[ $? -ne 0 ]]; then
    echo "Error: No se ha podido cargar la clave RSA."
    exit 1
fi

echo "1. Preparando servidor remoto..."
ssh -p 20127 $SSH_OPTS "$USER@ieticloudpro.ieti.cat" << 'EOF'
    echo "Creando directorio..."
    rm -rf ~/uxia-server  # Limpiar versión anterior
    mkdir -p ~/uxia-server
    
    echo "Deteniendo procesos anteriores..."
    # Buscar proceso en el puerto específico
    PORT_PID=$(lsof -ti:$SERVER_PORT 2>/dev/null)
    if [ ! -z "$PORT_PID" ]; then
        echo "Matando proceso en puerto $SERVER_PORT (PID: $PORT_PID)"
        kill -9 $PORT_PID
        sleep 2
    fi
    
    # Buscar procesos node relacionados con nuestra app
    NODE_PIDS=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')
    for pid in $NODE_PIDS; do
        echo "Matando proceso node (PID: $pid)"
        kill -9 $pid
    done
EOF

echo "2. Enviando archivos..."
echo "   Enviando: package.json, server.js, .env*, src/"

# Método 1: Usar tar + ssh (simple y eficiente)
tar czf - \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='proxmox' \
    --exclude='*.log' \
    --exclude='*.pid' \
    package.json \
    package-lock.json \
    server.js \
    .env* \
    init_db.js \
    seed.js \
    src/ 2>/dev/null | \
ssh -p 20127 $SSH_OPTS "$USER@ieticloudpro.ieti.cat" "cd ~/uxia-server && tar xzf -"

if [[ $? -ne 0 ]]; then
    echo "❌ Error al enviar archivos"
    ssh-agent -k
    exit 1
fi

echo "3. Configurando e iniciando la aplicación..."
ssh -t -p 20127 $SSH_OPTS "$USER@ieticloudpro.ieti.cat" << EOF
    cd ~/uxia-server
    
    echo "Instalando dependencias..."
    npm install --omit=dev
    
    echo "Verificando archivos recibidos..."
    ls -la
    
    echo "Creando .env si no existe..."
    if [ ! -f .env ] && [ -f .env.production ]; then
        cp .env.production .env
        echo "   Usando .env.production"
    elif [ ! -f .env ]; then
        echo "PORT=$SERVER_PORT" > .env
        echo "NODE_ENV=production" >> .env
        echo "   Creado .env básico"
    fi
    
    echo "Iniciando servidor..."
    export NODE_ENV=production
    nohup node server.js > server.log 2>&1 &
    
    SERVER_PID=\$!
    echo \$SERVER_PID > server.pid
    echo "   PID: \$SERVER_PID"
    
    echo "Esperando 5 segundos..."
    sleep 5
    
    echo "Verificando estado..."
    if curl -s -f http://localhost:$SERVER_PORT/health > /dev/null 2>&1; then
        echo "✅ SERVIDOR ACTIVO"
        echo "📍 URL: http://ieticloudpro.ieti.cat:$SERVER_PORT"
        echo "🩺 Health: http://ieticloudpro.ieti.cat:$SERVER_PORT/health"
        echo "📊 API: http://ieticloudpro.ieti.cat:$SERVER_PORT/api/users"
        echo ""
        echo "📋 LOGS:"
        tail -5 server.log
    else
        echo "❌ El servidor no responde"
        echo "Últimas líneas del log:"
        tail -20 server.log
        echo ""
        echo "Revisa manualmente:"
        echo "ssh $USER@ieticloudpro.ieti.cat -p 20127"
        echo "cd ~/uxia-server && tail -f server.log"
    fi
EOF

ssh-agent -k

echo ""
echo "=== DESPLIEGUE COMPLETADO ==="