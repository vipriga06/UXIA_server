//Codigo para crear usuario ADMIN inicial en DB(uxia_db)
require('dotenv').config();
const bcrypt = require('bcrypt');
const { User } = require('./src/models');

async function seedAdmin() {
    try {
        // Verifica si ya existe un admin
        const adminExists = await User.findOne({ where: { email: 'admin@uxia.com' } });
        
        if (!adminExists) {
            const passwordHash = await bcrypt.hash('admin123', 10);
            
            await User.create({
                nickname: 'admin',
                email: 'admin@uxia.com',
                passwordHash: passwordHash,
                role: 'admin'
            });
            
            console.log('✅ Usuario administrador creado:');
            console.log('   Email: admin@uxia.com');
            console.log('   Contraseña: admin123');
        } else {
            console.log('ℹ️  El usuario administrador ya existe');
        }
    } catch (error) {
        console.error('❌ Error creando admin:', error);
    } finally {
        process.exit();
    }
}

seedAdmin();