// src/controllers/adminController.js
const { User, Token } = require('../models');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

const saltRounds = 10;

const adminController = {
    // POST /api/admin/usuaris/login
    async loginAdmin(req, res) {
        try {
            const { email, password } = req.body;

            // Validación básica
            if (!email || !password) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Falten camps obligatoris",
                    data: null
                });
            }

            // Buscar usuario por email o nickname
            const { Op } = require('sequelize');
            const user = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: email },      // Busca per email
                        { nickname: email }     // Busca per nickname (el camp "email" conté el nickname)
                    ]
                }
            });

            if (!user) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Credencials incorrectes",
                    data: null
                });
            }

            // Verificar rol admin
            if (user.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit a administradors",
                    data: null
                });
            }

            // 🔐 Verificar contraseña con bcrypt
            const passwordMatch = await bcrypt.compare(password, user.passwordHash);
            
            if (!passwordMatch) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Credencials incorrectes",
                    data: null
                });
            }

            // Generar token (JWT amb userId)
            const token = generateToken(user.id);

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
                message: error.message,
                data: null
            });
        }
    },

    // POST /api/admin/usuaris/logout
    async logout(req, res) {
        try {
            const userId = req.userId;

            const existingToken = await Token.findOne({ where: { userId } });

            if (!existingToken) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Token invàlid o no existeix",
                    data: null
                });
            }

            //await existingToken.destroy();

            return res.status(200).json({
                status: "OK",
                message: "Logout correcte. Token eliminat.",
                data: null
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error en logout: " + error.message,
                data: null
            });
        }
    },

    // GET /api/admin/usuaris/testtoken
    async testToken(req, res) {
        try {
            const userId = req.userId;

            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Usuari no trobat",
                    data: null
                });
            }

            return res.status(200).json({
                status: "OK",
                message: "Token vàlid",
                data: {
                    userId: user.id,
                    nickname: user.nickname,
                    email: user.email,
                    telefon: user.telefon,
                    validat: user.validat,
                    tos: user.tos,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error validant token: " + error.message,
                data: null
            });
        }
    },

    // GET /api/admin/usuaris - Llistar usuaris
    async listUsers(req, res) {
        try {
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit",
                    data: null
                });
            }

            const users = await User.findAll({
                attributes: ['id', 'email', 'nickname', 'telefon', 'validat', 'tos', 'role', 'createdAt', 'updatedAt'],
                order: [['createdAt', 'DESC']]
            });

            return res.status(200).json({
                status: "OK",
                message: "Llistat d'usuaris",
                data: users
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error listant usuaris: " + error.message,
                data: null
            });
        }
    },

    // POST /api/admin/usuaris - Crear usuari (admin)
    async createUser(req, res) {
        try {
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit",
                    data: null
                });
            }

            const { email, nickname, password, telefon, role = 'user', validat = false, tos = false } = req.body;

            // Validación
            if (!email || !nickname || !password || !telefon) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Falten camps obligatoris (email, nickname, password, telefon)",
                    data: null
                });
            }

            // Verificar que no exista
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { email },
                        { nickname }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "L'email o nickname ja existeix",
                    data: null
                });
            }

            // 🔐 Generar hash de la contrasenya
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Crear usuario
            const newUser = await User.create({
                email,
                nickname,
                passwordHash: hashedPassword,
                role,
                telefon,
                validat,
                tos
            });

            return res.status(201).json({
                status: "OK",
                message: "Usuari creat correctament",
                data: {
                    id: newUser.id,
                    nickname: newUser.nickname,
                    email: newUser.email,
                    telefon: newUser.telefon,
                    validat: newUser.validat,
                    tos: newUser.tos,
                    role: newUser.role,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt
                }
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error creant usuari: " + error.message,
                data: null
            });
        }
    },

    // DELETE /api/admin/usuaris/:id
    async deleteUser(req, res) {
        try {
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit",
                    data: null
                });
            }

            const { id } = req.params;

            // No permitir que el admin se borre a sí mismo
            if (parseInt(id) === admin.id) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "No pots eliminar el teu compte d'administrador",
                    data: null
                });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Usuari no trobat",
                    data: null
                });
            }

            // Eliminar tokens asociados
            await Token.destroy({ where: { userId: id } });

            // Eliminar usuario
            await user.destroy();

            return res.status(200).json({
                status: "OK",
                message: "Usuari eliminat correctament",
                data: null
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error eliminant usuari: " + error.message,
                data: null
            });
        }
    },

    // PATCH /api/admin/usuaris/:id/rol
    async updateUserRole(req, res) {
        try {
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit",
                    data: null
                });
            }

            const { id } = req.params;
            const { role } = req.body;

            // No permitir que el admin cambie su propio rol
            if (parseInt(id) === admin.id) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "No pots canviar el rol del teu compte d'administrador",
                    data: null
                });
            }

            // Validar rol
            if (!role || !['admin', 'user'].includes(role)) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Rol invàlid. Ha de ser 'admin' o 'user'",
                    data: null
                });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Usuari no trobat",
                    data: null
                });
            }

            // Actualizar rol
            user.role = role;
            await user.save();

            return res.status(200).json({
                status: "OK",
                message: "Rol actualitzat correctament",
                data: {
                    id: user.id,
                    nickname: user.nickname,
                    email: user.email,
                    telefon: user.telefon,
                    validat: user.validat,
                    tos: user.tos,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error actualitzant rol: " + error.message,
                data: null
            });
        }
    }
};

module.exports = adminController;