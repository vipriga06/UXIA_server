#!/bin/bash
# proxmoxStop-simple.sh

source ./proxmox/config.env

USER=${1:-$DEFAULT_USER}
RSA_PATH=${2:-$DEFAULT_RSA_PATH}

echo "Deteniendo servidor Node.js para usuario: $USER"

eval "$(ssh-agent -s)"
ssh-add "$RSA_PATH"

ssh -p 20127 -oHostKeyAlgorithms=+ssh-rsa -oPubkeyAcceptedAlgorithms=+ssh-rsa \
    "$USER@ieticloudpro.ieti.cat" << 'EOF'
    echo "=== DETENIENDO APLICACIÓN ==="
    
    # Ir al directorio de la app
    cd ~/uxia-server 2>/dev/null || cd ~/uxia 2>/dev/null || pwd
    
    echo "1. Usando PID file si existe..."
    if [ -f server.pid ]; then
        PID=$(cat server.pid)
        echo "   PID encontrado: $PID"
        kill $PID 2>/dev/null && echo "✅ Proceso $PID detenido" || echo "⚠️  PID $PID no encontrado"
        rm -f server.pid
    fi
    
    echo "2. Buscando procesos node de server.js..."
    PIDS=$(ps aux | grep "node.*server.js" | grep -v grep | awk '{print $2}')
    if [ -n "$PIDS" ]; then
        echo "   Procesos encontrados: $PIDS"
        kill $PIDS 2>/dev/null
        echo "✅ Procesos Node.js detenidos"
    else
        echo "   No hay procesos server.js activos"
    fi
    
    echo "3. Verificando procesos npm..."
    NPMPIDS=$(ps aux | grep "npm" | grep -v grep | awk '{print $2}')
    if [ -n "$NPMPIDS" ]; then
        echo "   Procesos npm encontrados: $NPMPIDS"
        kill $NPMPIDS 2>/dev/null
    fi
    
    echo "4. Estado final:"
    echo "   Procesos node: $(ps aux | grep node | grep -v grep | wc -l)"
    echo "   Procesos npm: $(ps aux | grep npm | grep -v grep | wc -l)"
    
    echo ""
    echo "✅ Servidor detenido correctamente"
EOF

ssh-agent -k