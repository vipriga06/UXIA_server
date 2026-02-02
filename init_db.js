require('dotenv').config();
const { sequelize } = require('./src/models');

async function initializeDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a MySQL exitosa');

        const force = process.argv.includes('--force');
        const noSync = process.argv.includes('--no-sync');
        
        if (noSync) {
            console.log('⏸️  Sincronización desactivada por parámetro');
        } else if (force) {
            console.log('🔄 Modo FORCE: Recreando tablas...');
            await sequelize.sync({ force: true });
            console.log('✅ Tablas recreadas (todos los datos eliminados)');
        } else {
            console.log('🔄 Sincronizando tablas (modo ALTER)...');
            await sequelize.sync({ alter: true });
            console.log('✅ Tablas actualizadas');
        }

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
            if (!noSync) {
                console.log(`📊 Modo: ${force ? 'FORCE (sin datos)' : 'ALTER (con datos)'}`);
            }
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error.message);
        process.exit(1);
    }
}

initializeDatabase();