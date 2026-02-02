const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'uxia_db', // uxia_db
    process.env.MYSQL_USER || 'uxia_user',
    process.env.MYSQL_PASSWORD || 'password',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306, // Puerto estándar de MySQL
        dialect: 'mysql',
        // SOLUCIÓN: Elimina la referencia a logger o usa console.log
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = { sequelize };