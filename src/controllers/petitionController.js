const { Petition, Response, User } = require('../models');

const petitionController = {
    // Crear nueva petición
    async createPetition(req, res) {
        try {
            const { prompt, images, model } = req.body;
            const userId = req.userId; // Obtenido del middleware de autenticación

            // Validación
            if (!prompt || !model) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Falten camps obligatoris (prompt, model)"
                });
            }

            const petition = await Petition.create({
                prompt,
                images: images || null,
                model,
                userId
            });

            return res.status(201).json({
                status: "OK",
                message: "Petició creada correctament",
                data: {
                    id: petition.id,
                    prompt: petition.prompt,
                    model: petition.model,
                    images: petition.images,
                    createdAt: petition.createdAt
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Obtener todas las peticiones (con paginación)
    async getPetitions(req, res) {
        try {
            const { page = 1, limit = 10, userId } = req.query;
            const offset = (page - 1) * limit;

            let where = {};
            if (userId) {
                where.userId = userId;
            }

            const { count, rows } = await Petition.findAndCountAll({
                where,
                include: [
                    {
                        model: Response,
                        attributes: ['id', 'status', 'message']
                    },
                    {
                        model: User,
                        attributes: ['id', 'nickname', 'email']
                    }
                ],
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });

            return res.json({
                status: "OK",
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Obtener petición por ID
    async getPetitionById(req, res) {
        try {
            const { id } = req.params;

            const petition = await Petition.findByPk(id, {
                include: [
                    {
                        model: Response,
                        attributes: ['id', 'status', 'message', 'data']
                    },
                    {
                        model: User,
                        attributes: ['id', 'nickname', 'email']
                    }
                ]
            });

            if (!petition) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Petició no encontrada"
                });
            }

            return res.json({
                status: "OK",
                data: petition
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Obtener peticiones del usuario autenticado
    async getPetitionsByUser(req, res) {
        try {
            const userId = req.userId; // Obtenido del middleware
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { count, rows } = await Petition.findAndCountAll({
                where: { userId },
                include: [
                    {
                        model: Response,
                        attributes: ['id', 'status', 'message']
                    }
                ],
                offset,
                limit: parseInt(limit),
                order: [['createdAt', 'DESC']]
            });

            return res.json({
                status: "OK",
                data: rows,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(count / limit)
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Actualizar petición
    async updatePetition(req, res) {
        try {
            const { id } = req.params;
            const { prompt, images, model } = req.body;
            const userId = req.userId;

            const petition = await Petition.findByPk(id);

            if (!petition) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Petició no encontrada"
                });
            }

            // Verificar que el usuario sea el propietario
            if (petition.userId !== userId) {
                return res.status(403).json({
                    status: "ERROR",
                    message: "No tens permís per actualitzar aquesta petició"
                });
            }

            await petition.update({
                prompt: prompt || petition.prompt,
                images: images !== undefined ? images : petition.images,
                model: model || petition.model
            });

            return res.json({
                status: "OK",
                message: "Petició actualitzada correctament",
                data: petition
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Eliminar petición
    async deletePetition(req, res) {
        try {
            const { id } = req.params;
            const userId = req.userId;

            const petition = await Petition.findByPk(id);

            if (!petition) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Petició no encontrada"
                });
            }

            // Verificar que el usuario sea el propietario
            if (petition.userId !== userId) {
                return res.status(403).json({
                    status: "ERROR",
                    message: "No tens permís per eliminar aquesta petició"
                });
            }

            await petition.destroy();

            return res.json({
                status: "OK",
                message: "Petició eliminada correctament"
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    }
};

module.exports = petitionController;
