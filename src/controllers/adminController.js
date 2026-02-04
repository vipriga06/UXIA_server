const { User, Token } = require('../models');
const generateToken = require('../../utils/generateToken');

const adminController = {
    async loginAdmin(req, res) {
        try {
            const { email, password } = req.body;

            // Validación básica
            if (!email || !password) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Falten camps obligatoris"
                });
            }

            // Buscar usuario por email
            const user = await User.findOne({ where: { email } });

            if (!user) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Credencials incorrectes"
                });
            }

            // Verificar rol admin
            if (user.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit a administradors"
                });
            }

            // Verificar contraseña
            // ⚠️ Aquí deberías usar bcrypt.compare si más adelante lo implementas
            if (user.passwordHash !== password) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Credencials incorrectes"
                });
            }

            // Generar token
            const token = generateToken();

            // Guardar o actualizar token
            const existingToken = await Token.findOne({ where: { userId: user.id } });

            if (existingToken) {
                existingToken.token = token;
                await existingToken.save();
            } else {
                await Token.create({
                    token,
                    userId: user.id
                });
            }

            return res.status(200).json({
                status: "OK",
                message: "Usuari autenticat correctament",
                data: {
                    token
                }
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    }
};

module.exports = adminController;
