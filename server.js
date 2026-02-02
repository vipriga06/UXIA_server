require('dotenv').config();
const express = require('express');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

(async () => {
    try {
        await sequelize.authenticate();
        console.log('Conectado a MySQL');

        await sequelize.sync({ alter: true });
        console.log('Modelos sincronizados');

        app.listen(PORT, () => {
            console.log(`Server escuchando en puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error al arrancar el server:', error);
    }
})();
