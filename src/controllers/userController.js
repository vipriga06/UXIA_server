const { User } = require('../models');

const { Token } = require('../models');
const generateToken = require('../utils/generateToken');
const crypto = require('crypto');

const userController = {
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: ['id', 'nickname', 'email', 'role', 'createdAt']
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async getUserById(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: ['id', 'nickname', 'email', 'role', 'createdAt']
            });
            
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async createUser(req, res) {
        try {
            const { nickname, email, password, role } = req.body;
            
            const user = await User.create({
                nickname,
                email,
                passwordHash: password, // En producción usarías bcrypt
                role: role || 'user'
            });
            
            res.status(201).json({
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                role: user.role
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async loginUser(req, res) {
        try {
            const { nickname, email, telefon } = req.body;

            // 1. Validación básica
            if (!nickname || !email || !telefon) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Falten camps obligatoris"
                });
            }

            // 2. Comprobar email duplicado
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({
                    status: "ERROR",
                    message: "Email ja registrat"
                });
            }

            // 3. Password interno automático
            const passwordHash = crypto.randomBytes(16).toString('hex');

            // 4. Crear usuario
            const user = await User.create({
                nickname,
                email,
                telefon,
                passwordHash,
                role: 'user'
            });

            // 5. Generar token
            const apiKey = generateToken();

            // 6. Guardar token en tabla Token
            await Token.create({
                token: apiKey,
                userId: user.id
            });

            // 7. Respuesta final
            return res.status(201).json({
                status: "OK",
                message: "L'usuari s'ha creat correctament",
                data: {
                    nickname: user.nickname,
                    email: user.email,
                    api_key: apiKey
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

module.exports = userController;