# Conecta al servidor remoto usando SSH

# Cargar las variables de configuración
. .\config.env

# Obtener los parámetros de entrada o valores por defecto
param(
    [string]$User = $DEFAULT_USER,
    [string]$RSAPath = $DEFAULT_RSA_PATH
)

# Eliminar cualquier salto de línea extra en la ruta RSA
$RSAPath = $RSAPath.TrimEnd("`r")

# Opciones SSH
$SSHOpts = "-oHostKeyAlgorithms=+ssh-rsa -oPubkeyAcceptedAlgorithms=+ssh-rsa"

# Mostrar la información
Write-Host "Usuario: $User"
Write-Host "Ruta RSA: $RSAPath"

# Verificar si el archivo de clave RSA existe
if (-Not (Test-Path -Path $RSAPath)) {
    Write-Host "Error: No se ha encontrado el archivo de clave privada: $RSAPath"
    exit 1
}

# Establecer la conexión SSH
ssh -i $RSAPath -p 20127 $SSHOpts "$User@ieticloudpro.ieti.cat"
