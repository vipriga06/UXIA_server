#!/bin/bash
# Setup NAT redirect: 80 -> $SERVER_PORT (idempotent)

source ./proxmox/config.env

USER=${1:-$DEFAULT_USER}
RSA_PATH=${2:-"$DEFAULT_RSA_PATH"}
SERVER_PORT=${3:-$DEFAULT_SERVER_PORT}
SSH_OPTS='-oHostKeyAlgorithms=+ssh-rsa -oPubkeyAcceptedAlgorithms=+ssh-rsa'

echo "Server port: $SERVER_PORT"
[[ -f "$RSA_PATH" ]] || { echo "Error: no troba la clau: $RSA_PATH"; exit 1; }

read -s -p "Pwd sudo remota: " SUDO_PASSWORD
echo
ESC_PWD=$(printf "%q" "$SUDO_PASSWORD")

eval "$(ssh-agent -s)"
ssh-add "$RSA_PATH"

# Prepare remote script with real port substituted
REMOTE_SCRIPT=$(cat <<'EOF'
run_sudo() { echo "$SUDO_PASSWORD" | sudo -S -p '' "$@"; }

# Idempotent check
if run_sudo iptables -t nat -C PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports SERVER_PORT_VALUE 2>/dev/null; then
  echo "Ja existeix la redirecció 80 -> SERVER_PORT_VALUE"
else
  echo "Afegint redirecció 80 -> SERVER_PORT_VALUE..."
  run_sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-ports SERVER_PORT_VALUE
fi

echo "✔︎ Redirecció 80 -> SERVER_PORT_VALUE configurada."
EOF
)

# Substitute port before sending
REMOTE_SCRIPT="${REMOTE_SCRIPT//SERVER_PORT_VALUE/$SERVER_PORT}"

ssh -T -p 20127 $SSH_OPTS "$USER@ieticloudpro.ieti.cat" "SUDO_PWD=$ESC_PWD bash -s" <<<"$REMOTE_SCRIPT"

ssh-agent -k