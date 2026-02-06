const { Token } = require('../models');

/**
 * Middleware para validar token de autorización
 * Espera el token en el header: Authorization: Bearer <token>
 */
const authTokenMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                status: "ERROR",
                message: "Token no proporcionat"
            });
        }

        const token = authHeader.substring(7);

        // Buscar token en BD
        const tokenRecord = await Token.findOne({ where: { token } });

        if (!tokenRecord) {
            return res.status(401).json({
                status: "ERROR",
                message: "Token invàlid"
            });
        }

        // Guardar userId en req para usar en controllers
        req.userId = tokenRecord.userId;
        next();

    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: "Error en validació de token: " + error.message
        });
    }
};

module.exports = authTokenMiddleware;
