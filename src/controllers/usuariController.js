// src/controllers/usuariController.js
const { User, Token } = require('../models');
const { logger } = require('../config/logger');
const generateToken = require('../utils/generateToken');
const { Op } = require('sequelize');
const fetch = require('node-fetch');

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

            // Generar codi de validació (6 dígits)
            const codiValidacio = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Crear usuari amb codi de validació
            const newUser = await User.create({
                nickname,
                email,
                telefon,
                passwordHash: null,
                role: 'user',
                validat: false,
                tos: false,
                validationCode: codiValidacio,
                validationCodeExpires: new Date(Date.now() + 10 * 60 * 1000) // 10 minuts
            });

            // Enviar SMS amb l'API del IETI Cloud
            try {
                const smsUrl = process.env.SMS_API_URL || 'http://192.168.1.16:8000/api/sendsms/';
                const params = new URLSearchParams({
                    username: process.env.SMS_USERNAME || 'uxia3',
                    api_token: process.env.SMS_API_TOKEN || 'iPa6v58feLR10Hqrga3twzILZNvgo2QYbbPTsz60CQh7RDGz39E9cQ7tAwriAgre',
                    receiver: telefon,
                    text: `El teu codi de validació UXIA és: ${codiValidacio}`
                });

                logger.info(`Enviant SMS a ${telefon} amb codi: ${codiValidacio}`);
                
                const response = await fetch(`${smsUrl}?${params}`, {
                    method: 'GET',
                    timeout: 5000
                });

                if (!response.ok) {
                    logger.error('Error enviant SMS:', await response.text());
                }
            } catch (smsError) {
                logger.error('Error en connexió amb SMS Gateway:', smsError.message);
                // Continuem encara que falli l'SMS (per proves)
            }

            return res.status(201).json({
                status: 'OK',
                message: "L'usuari s'ha creat correctament. Rebràs un SMS amb el codi de validació.",
                data: {
                    nickname: newUser.nickname,
                    email: newUser.email,
                    telefon: newUser.telefon
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

            // Buscar usuari per telèfon amb codi vigent
            const user = await User.findOne({
                where: {
                    telefon,
                    validationCode: codi_validacio,
                    validationCodeExpires: { [Op.gt]: new Date() } // No expirat
                }
            });

            if (!user) {
                return res.status(401).json({
                    status: 'ERROR',
                    message: 'Codi de validació incorrecte o expirat',
                    data: null
                });
            }

            // Validar usuari
            user.validat = true;
            user.validationCode = null;
            user.validationCodeExpires = null;
            await user.save();

            // Eliminar API_KEY antiga (si en tenia) i crear nova
            await Token.destroy({ where: { userId: user.id } });
            
            const apiKey = generateToken(user.id);
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
            const userId = req.userId;

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
    },

    // POST /api/usuaris/revalidar (opcional - per regenerar API_KEY)
    async revalidar(req, res) {
        try {
            const { telefon } = req.body;

            if (!telefon) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falta el telèfon',
                    data: null
                });
            }

            const user = await User.findOne({ 
                where: { 
                    telefon, 
                    validat: true 
                } 
            });
            
            if (!user) {
                return res.status(404).json({
                    status: 'ERROR',
                    message: 'Usuari no trobat o no validat',
                    data: null
                });
            }

            // Eliminar API_KEY antiga
            await Token.destroy({ where: { userId: user.id } });

            // Generar nova API_KEY
            const apiKey = generateToken(user.id);
            await Token.create({
                token: apiKey,
                userId: user.id
            });

            return res.status(200).json({
                status: 'OK',
                message: 'API_KEY regenerada correctament',
                data: {
                    api_key: apiKey
                }
            });

        } catch (error) {
            logger.error('Error en revalidar:', error);
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: null
            });
        }
    }
};

module.exports = usuariController;