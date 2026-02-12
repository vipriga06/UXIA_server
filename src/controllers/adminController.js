const { User, Token } = require('../models');
const generateToken = require('../utils/generateToken');

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
                message: error.message
            });
        }
    },

    async logout(req, res) {
        try {
            const userId = req.userId; // Viene del middleware de autenticación

            // Buscar y eliminar el token
            const existingToken = await Token.findOne({ where: { userId } });

            if (!existingToken) {
                return res.status(401).json({
                    status: "ERROR",
                    message: "Token invàlid o no existeix"
                });
            }

            await existingToken.destroy();

            return res.status(200).json({
                status: "OK",
                message: "Logout correcte. Token eliminat."
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error en logout: " + error.message
            });
        }
    },

    async testToken(req, res) {
        try {
            const userId = req.userId; // Viene del middleware de autenticación

            // El token ya ha sido validado por el middleware
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Usuari no trobat"
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
                message: "Error validant token: " + error.message
            });
        }
    },

    async listUsers(req, res) {
        try {
            // req.userId viene del middleware, verificamos que sea admin
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit"
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
                message: "Error listant usuaris: " + error.message
            });
        }
    },

    async createUser(req, res) {
        try {
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit"
                });
            }

            const { email, nickname, password, telefon, role = 'user', validat = false, tos = false } = req.body;

            // Validación
            if (!email || !nickname || !password || !telefon) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Falten camps obligatoris (email, nickname, password, telefon)"
                });
            }

            // Verificar que no exista
            const existingUser = await User.findOne({
                where: {
                    [require('sequelize').Op.or]: [
                        { email },
                        { nickname }
                    ]
                }
            });

            if (existingUser) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "L'email o nickname ja existeix"
                });
            }

            // Crear usuario
            const newUser = await User.create({
                email,
                nickname,
                passwordHash: password, // ⚠️ Usar bcrypt en producción
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
                message: "Error creant usuari: " + error.message
            });
        }
    },

    async deleteUser(req, res) {
        try {
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit"
                });
            }

            const { id } = req.params;

            // No permitir que el admin se borre a sí mismo
            if (parseInt(id) === admin.id) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "No pots eliminar el teu compte d'administrador"
                });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Usuari no trobat"
                });
            }

            // Eliminar tokens asociados
            await Token.destroy({ where: { userId: id } });

            // Eliminar usuario
            await user.destroy();

            return res.status(200).json({
                status: "OK",
                message: "Usuari eliminat correctament"
            });

        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: "Error eliminant usuari: " + error.message
            });
        }
    },

    async updateUserRole(req, res) {
        try {
            const admin = await User.findByPk(req.userId);

            if (admin.role !== 'admin') {
                return res.status(403).json({
                    status: "ERROR",
                    message: "Accés restringit"
                });
            }

            const { id } = req.params;
            const { role } = req.body;

            // No permitir que el admin cambie su propio rol
            if (parseInt(id) === admin.id) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "No pots canviar el rol del teu compte d'administrador"
                });
            }

            // Validar rol
            if (!role || !['admin', 'user'].includes(role)) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Rol invàlid. Debes ser 'admin' o 'user'"
                });
            }

            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Usuari no trobat"
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
                message: "Error actualitzant rol: " + error.message
            });
        }
    }
};

module.exports = adminController;
