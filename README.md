# 🚀 UXIA Server

API REST per a gestió d'usuaris i administració del sistema UXIA.

## 📋 Requisits

- Node.js (v16 o superior)
- MySQL (v8.0 o superior)
- npm o yarn

## ⚙️ Configuració

### Desenvolupament Local

1. **Clonar el repositori**
```bash
git clone <repo-url>
cd UXIA_server
```

2. **Instal·lar dependències**
```bash
npm install
```

3. **Configurar base de dades**

**Opció A: MySQL Local**
- Assegura't que MySQL estigui corrent en el port 3306
- Usa el fitxer `.env` per defecte

**Opció B: MySQL Remot (via túnel SSH)**
```bash
# Iniciar túnel SSH
./proxmox/proxmoxTunelStart.sh

# Usa .env.development (ja configurat per port 3307)
cp .env.development .env
```

4. **Executar en desenvolupament**
```bash
npm run dev
```

El servidor s'executarà en: `http://localhost:3000`

### Producció (Servidor Remot)

1. **Desplegar al servidor**
```bash
./proxmox/proxmoxRun.sh
```

Aquest script:
- Copia tots els arxius necessaris
- Usa `.env.production` (MySQL local port 3306)
- Instal·la dependències
- Inicia el servidor amb `nohup`

2. **Verificar desplegament**
```bash
curl https://uxia3.ieti.site/health
```

## 📁 Estructura del Projecte

```
UXIA_server/
├── src/
│   ├── config/          # Configuració (DB, logger, swagger)
│   ├── controllers/     # Controladors (admin, user)
│   ├── middleware/      # Middleware d'autenticació
│   ├── models/          # Models Sequelize (User, Token, etc)
│   ├── routes/          # Rutes de l'API
│   └── utils/           # Utilitats (generateToken, seed, etc)
├── proxmox/             # Scripts de desplegament
├── .env                 # Variables d'entorn (Git ignored)
├── .env.development     # Configuració desenvolupament (túnel SSH)
├── .env.production      # Configuració producció (MySQL local)
└── server.js            # Punt d'entrada
```

## 🔌 Variables d'Entorn

### `.env.development` (Desenvolupament amb túnel SSH)
```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3307          # Túnel SSH
MYSQL_DATABASE=uxia_db
MYSQL_USER=uxia_user
MYSQL_PASSWORD=password
```

### `.env.production` (Producció)
```bash
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306          # MySQL local
MYSQL_DATABASE=uxia_db
MYSQL_USER=uxia_user
MYSQL_PASSWORD=password
```

## 📡 Endpoints Principals

### Admins
- `POST /api/admin/usuaris/login` - Login administrador
- `GET /api/admin/usuaris` - Llistar usuaris (protected)
- `POST /api/admin/usuaris` - Crear usuari (protected)
- `DELETE /api/admin/usuaris/:id` - Eliminar usuari (protected)
- `PATCH /api/admin/usuaris/:id/rol` - Canviar rol (protected)

### Usuaris
- `POST /api/users/registrar` - Registre d'usuari
- `POST /api/users/validar` - Validar usuari (SMS)
- `GET /api/users/perfil` - Obtenir perfil (protected)

### Health
- `GET /health` - Estat del servidor
- `GET /health/db` - Estat de la connexió a MySQL

## 🛠 Scripts Disponibles

```bash
npm start          # Producció
npm run dev        # Desenvolupament (nodemon)
npm test           # Tests amb Jest
npm run test:watch # Tests en mode watch
```

## 🔐 Autenticació

L'API utilitza **Bearer Token** authentication:

```bash
Authorization: Bearer <TOKEN>
```

## 📚 Documentació API

Swagger disponible a: `http://localhost:3000/api-docs`

## 🐛 Troubleshooting

### Error: Can't connect to MySQL (3307)
```bash
# Verifica que el túnel SSH estigui actiu
./proxmox/proxmoxTunelStatus.sh

# Si no està actiu, inicia'l
./proxmox/proxmoxTunelStart.sh
```

### Error: Can't connect to MySQL (3306)
```bash
# Verifica que MySQL estigui corrent
mysqladmin -u uxia_user -p ping

# O inicia MySQL
brew services start mysql  # macOS
sudo systemctl start mysql # Linux
```

## 👥 Equip de Desenvolupament

- Victor P.
- Christopher C.
- Sabrina E.

---

**Fet amb ❤️ per l'equip A.I.D.A**