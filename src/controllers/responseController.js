const { Response, Petition } = require('../models');

const responseController = {
    // Obtener respuesta de una petición
    async getResponseByPetition(req, res) {
        try {
            const { petitionId } = req.params;

            const petition = await Petition.findByPk(petitionId);

            if (!petition) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Petició no encontrada"
                });
            }

            const response = await Response.findOne({
                where: { petitionId },
                include: [
                    {
                        model: Petition,
                        attributes: ['id', 'prompt', 'model']
                    }
                ]
            });

            if (!response) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Resposta no encontrada"
                });
            }

            return res.json({
                status: "OK",
                data: response
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Crear respuesta para una petición
    async createResponse(req, res) {
        try {
            const { petitionId } = req.params;
            const { status, message, data } = req.body;

            // Validación
            if (!status || !message) {
                return res.status(400).json({
                    status: "ERROR",
                    message: "Falten camps obligatoris (status, message)"
                });
            }

            // Verificar que la petición existe
            const petition = await Petition.findByPk(petitionId);

            if (!petition) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Petició no encontrada"
                });
            }

            // Verificar si ya existe una respuesta para esta petición
            const existingResponse = await Response.findOne({
                where: { petitionId }
            });

            if (existingResponse) {
                return res.status(409).json({
                    status: "ERROR",
                    message: "Ja existeix una resposta per aquesta petició"
                });
            }

            const response = await Response.create({
                petitionId,
                status,
                message,
                data: data || null
            });

            return res.status(201).json({
                status: "OK",
                message: "Resposta creada correctament",
                data: {
                    id: response.id,
                    petitionId: response.petitionId,
                    status: response.status,
                    message: response.message,
                    data: response.data,
                    createdAt: response.createdAt
                }
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Actualizar respuesta
    async updateResponse(req, res) {
        try {
            const { petitionId } = req.params;
            const { status, message, data } = req.body;

            const response = await Response.findOne({
                where: { petitionId }
            });

            if (!response) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Resposta no encontrada"
                });
            }

            await response.update({
                status: status || response.status,
                message: message || response.message,
                data: data !== undefined ? data : response.data
            });

            return res.json({
                status: "OK",
                message: "Resposta actualitzada correctament",
                data: response
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Eliminar respuesta
    async deleteResponse(req, res) {
        try {
            const { petitionId } = req.params;

            const response = await Response.findOne({
                where: { petitionId }
            });

            if (!response) {
                return res.status(404).json({
                    status: "ERROR",
                    message: "Resposta no encontrada"
                });
            }

            await response.destroy();

            return res.json({
                status: "OK",
                message: "Resposta eliminada correctament"
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    },

    // Obtener todas las respuestas (para admin)
    async getAllResponses(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const offset = (page - 1) * limit;

            let where = {};
            if (status) {
                where.status = status;
            }

            const { count, rows } = await Response.findAndCountAll({
                where,
                include: [
                    {
                        model: Petition,
                        attributes: ['id', 'prompt', 'model']
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
    }
};

module.exports = responseController;
