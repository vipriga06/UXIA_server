// src/controllers/usuariController.js
const { User, Token } = require('../models');
const { logger } = require('../config/logger');
const generateToken = require('../utils/generateToken');
const { Op } = require('sequelize');

const usuariController = {
    // POST /api/usuaris/registrar
    async registrar(req, res) {
        try {
            const { nickname, email, telefon } = req.body;

            // Validacions
            if (!nickname || !email || !telefon) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falten camps obligatoris: nickname, email, telefon',
                    data: null
                });
            }

            // Comprovar si l'usuari ja existeix
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
                    message: "L'email o nickname ja està registrat",
                    data: null
                });
            }

            // Crear usuari (sense password, encara no validat)
            const newUser = await User.create({
                nickname,
                email,
                telefon,
                passwordHash: null, // Encara no té password
                role: 'user',
                validat: false,
                tos: false
            });

            // 🔥 SIMULACIÓ: Enviar SMS amb codi de validació
            const codiValidacio = Math.floor(100000 + Math.random() * 900000); // 6 dígits
            logger.info(`SMS enviat a ${telefon} amb codi: ${codiValidacio}`);
            
            // ⚠️ IMPORTANT: En producció, guardar codi a BD amb expiració
            // Per ara, ho retornem per proves (després ho treurem)
            
            return res.status(201).json({
                status: 'OK',
                message: "L'usuari s'ha creat correctament",
                data: {
                    nickname: newUser.nickname,
                    email: newUser.email
                }
            });

        } catch (error) {
            logger.error('Error en registrar usuari:', error);
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: null
            });
        }
    },

    // POST /api/usuaris/validar
    async validar(req, res) {
        try {
            const { telefon, codi_validacio } = req.body;

            if (!telefon || !codi_validacio) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falten camps: telefon i codi_validacio',
                    data: null
                });
            }

            // 🔥 SIMULACIÓ: Per proves, acceptem 123456
            // Després ho canviaràs per consultar a BD
            if (codi_validacio !== 123456) {
                return res.status(401).json({
                    status: 'ERROR',
                    message: 'Codi de validació incorrecte',
                    data: null
                });
            }

            // Buscar usuari per telèfon
            const user = await User.findOne({ where: { telefon } });
            if (!user) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Usuari no trobat',
                    data: null
                });
            }

            // Validar usuari
            user.validat = true;
            await user.save();

            // Generar API_KEY (token)
            const apiKey = generateToken(user.id);

            // Guardar token a BD
            await Token.create({
                token: apiKey,
                userId: user.id
            });

            return res.status(200).json({
                status: 'OK',
                message: 'Usuari validat correctament',
                data: {
                    api_key: apiKey
                }
            });

        } catch (error) {
            logger.error('Error en validar usuari:', error);
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: null
            });
        }
    },

    // GET /api/usuaris/perfil
    async perfil(req, res) {
        try {
            const userId = req.userId; // Del middleware

            const user = await User.findByPk(userId, {
                attributes: ['nickname', 'email', 'telefon', 'validat', 'tos']
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
                message: "Informació de l'usuari obtinguda correctament",
                data: {
                    nickname: user.nickname,
                    email: user.email,
                    telefon: user.telefon,
                    validat: user.validat,
                    tos: user.tos
                }
            });

        } catch (error) {
            logger.error('Error obtenint perfil:', error);
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: null
            });
        }
    }
};

module.exports = usuariController;