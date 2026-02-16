// src/controllers/userController.js
const { User, Token } = require('../models');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const saltRounds = 10;

const userController = {
    // GET /api/users - Obtener todos los usuarios
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: ['id', 'nickname', 'email', 'role', 'createdAt']
            });
            
            return res.status(200).json({
                status: 'OK',
                message: 'Llistat d\'usuaris obtingut correctament',
                data: users
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERROR',
                message: error.message,
                data: null
            });
        }
    },
    
    // GET /api/users/:id - Obtener usuario por ID
    async getUserById(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: ['id', 'nickname', 'email', 'role', 'createdAt']
            });
            
            if (!user) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Usuari no trobat',
                    data: null
                });
            }
            
            return res.status(200).json({
                status: 'OK',
                message: 'Usuari trobat',
                data: user
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERROR',
                message: error.message,
                data: null
            });
        }
    },
    
    // POST /api/users - Crear nuevo usuario
    async createUser(req, res) {
        try {
            const { nickname, email, password, role } = req.body;

            // Validaciones básicas
            if (!nickname || !email || !password) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falten camps obligatoris: nickname, email, password',
                    data: null
                });
            }

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { email },
                        { nickname }
                    ]
                }
            });

            if (existingUser) {
                return res.status(409).json({
                    status: 'ERROR',
                    message: 'L\'email o nickname ja està registrat',
                    data: null
                });
            }

            // 🔐 Generar hash de la contrasenya
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            
            const user = await User.create({
                nickname,
                email,
                passwordHash: hashedPassword,
                role: role || 'user',
                telefon: req.body.telefon || '',
                validat: false,
                tos: false
            });
            
            return res.status(201).json({
                status: 'OK',
                message: 'Usuari creat correctament',
                data: {
                    id: user.id,
                    nickname: user.nickname,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: 'ERROR',
                message: error.message,
                data: null
            });
        }
    },

    // POST /api/users/login - Login d'usuari normal
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;

            // Validación básica
            if (!email || !password) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Email i contrasenya són obligatoris",
                    data: null
                });
            }

            // Buscar usuario por email O por nickname
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: email },
                        { nickname: email }
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Usuari no trobat",
                    data: null
                });
            }

            // 🔐 Verificar contrasenya amb bcrypt
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            
            if (!passwordMatch) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Contrasenya incorrecta",
                    data: null
                });
            }

            // Generar token (JWT amb userId)
            const token = generateToken(user.id);

            // Guardar token a BD
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
                message: error.message,
                data: null
            });
        }
    }
};

module.exports = userController;