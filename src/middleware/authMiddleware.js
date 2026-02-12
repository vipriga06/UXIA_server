// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const { Token } = require('../models');

const authTokenMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: "ERROR",
                message: "Token no proporcionat"
            });
        }

        const tokenValue = authHeader.substring(7);

        // 1. Verificar JWT
        let decoded;
        try {
            decoded = jwt.verify(tokenValue, process.env.JWT_SECRET || 'clau_secreta_temporal');
        } catch (error) {
            return res.status(401).json({
                status: "ERROR",
                message: "Token invàlid o expirat"
            });
        }

        // 2. Verificar que existeix a BD
        const tokenRecord = await Token.findOne({ 
            where: { 
                token: tokenValue,
                userId: decoded.userId 
            } 
        });

        if (!tokenRecord) {
            return res.status(401).json({
                status: "ERROR",
                message: "Token no vàlid"
            });
        }

        req.userId = decoded.userId;
        req.token = tokenValue;
        next();

    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: "Error en validació de token: " + error.message
        });
    }
};

module.exports = authTokenMiddleware;