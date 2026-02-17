require('dotenv').config();
const express = require('express');
const { sequelize } = require('./src/models');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const { logger, expressLogger } = require('./src/config/logger')

const userRoutes = require('./src/routes/userRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const imageRoutes = require('./src/routes/imageRoutes');
const usuariRoutes = require('./src/routes/usuariRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rutas de salud
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
});

app.get('/health/db', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({ 
            status: 'OK', 
            database: 'connected',
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            database: 'disconnected',
            error: error.message 
        });
    }
});

// RUTES DE API
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analitzar-imatge', imageRoutes); 
app.use('/api/usuaris', usuariRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Base de datos conectada');
        
        // Sincronizar models con la DB
        await sequelize.sync({force: false});
        console.log('Modelos sincronizados');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
        });


    } catch (error) {
        console.error('Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

module.exports = app;
startServer();