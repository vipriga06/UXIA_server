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
                passwordHash: password, 
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
            const { email, password } = req.body;

            // Validación básica
            if (!email || !password) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Email/usuario y contraseña son obligatorios"
                });
            }

            // Buscar usuario por email O por nickname
            const { Op } = require('sequelize');
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                        { nickname: email } // Permite usar nickname como login
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Usuario no encontrado"
                });
            }

            // Verificar contraseña comparando con hash bcrypt
            const bcrypt = require('bcrypt');
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            
            if (!passwordMatch) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Contraseña incorrecta"
                });
            }

            // Generar token
            const token = generateToken();

            // Guardar token en tabla Token
            await Token.create({
                token: token,
                userId: user.id
            });

            // Respuesta final
            return res.status(200).json({
                status: "OK",
                message: "Usuari autenticat correctament",
                data: {
                    token: token,
                    user: {
                        id: user.id,
                        nickname: user.nickname,
                        email: user.email,
                        role: user.role
                    }
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