const { Token } = require('../models');

// Middleware para autenticar usando API Key
const authMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers['x-api-key'] || req.query.api_key;

        if (!apiKey) {
            return res.status(401).json({
                status: "ERROR",
                message: "API Key requerida"
            });
        }

        const token = await Token.findOne({
            where: { token: apiKey }
        });

        if (!token) {
            return res.status(401).json({
                status: "ERROR",
                message: "API Key inválida"
            });
        }

        // Pasar el userId al request para usarlo en los controladores
        req.userId = token.userId;
        next();
    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: error.message
        });
    }
};

// Middleware para verificar si el usuario es admin
const adminMiddleware = async (req, res, next) => {
    try {
        const { User } = require('../models');
        const userId = req.userId;

        const user = await User.findByPk(userId);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                status: "ERROR",
                message: "Només els administradors poden accedir a aquest recurs"
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            status: "ERROR",
            message: error.message
        });
    }
};

module.exports = { authMiddleware, adminMiddleware };
