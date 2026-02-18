// createAdmin.js
require('dotenv').config(); // 🔴 AFEGIR AIXÓ AL PRINCIPI!
const bcrypt = require('bcrypt');
const { sequelize, User } = require('./src/models');

async function createAdmin() {
    try {
        console.log('🟡 Intentant connectar amb:');
        console.log('   HOST:', process.env.MYSQL_HOST);
        console.log('   PORT:', process.env.MYSQL_PORT);
        console.log('   USER:', process.env.MYSQL_USER);
        console.log('   DATABASE:', process.env.MYSQL_DATABASE);

        await sequelize.authenticate();
        console.log('✅ Connectat a la BD');

        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Comprovar si ja existeix un admin
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        if (existingAdmin) {
            console.log('⚠️ Ja existeix un administrador:');
            console.log('   Email:', existingAdmin.email);
            console.log('   Per crear un altre, canvia el email');
            process.exit();
        }

        const admin = await User.create({
            nickname: 'admin',
            email: 'admin@uxia.com',
            telefon: '+34 600 000 000',
            passwordHash: hashedPassword,
            role: 'admin',
            validat: true,
            tos: true
        });

        console.log('✅ Admin creat correctament:');
        console.log('   Email: admin@uxia.com');
        console.log('   Password:', password);
        console.log('   ID:', admin.id);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
        process.exit();
    }
}

createAdmin();