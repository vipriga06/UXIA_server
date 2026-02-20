// src/controllers/tagsController.js
const { Response } = require('../models');
const { logger } = require('../config/logger');
const { Op } = require('sequelize');

const tagsController = {
    // GET /api/tags/stats - Retorna tots els tags generats
    async getAllTags(req, res) {
        try {
            logger.info('Obtenint tots els tags...');

            // Buscar totes les respostes que tinguin tags
            const responses = await Response.findAll({
                where: {
                    'data.tags': {
                        [Op.ne]: null // Tags no nuls
                    }
                },
                attributes: ['data'], // Només necessitem el camp data
                order: [['createdAt', 'DESC']]
            });

            // Extreure tots els tags
            let allTags = [];
            
            responses.forEach(response => {
                if (response.data && response.data.tags && Array.isArray(response.data.tags)) {
                    allTags = [...allTags, ...response.data.tags];
                }
            });

            // Comptar freqüència de cada tag
            const tagCount = {};
            allTags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });

            // Ordenar tags per freqüència (més usats primer)
            const sortedTags = Object.entries(tagCount)
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => ({ tag, count }));

            return res.status(200).json({
                status: 'OK',
                message: 'Tags obtinguts correctament',
                data: {
                    total_tags: allTags.length,
                    unique_tags: Object.keys(tagCount).length,
                    tags: sortedTags,
                    all_tags: [...new Set(allTags)] // Tags únics
                }
            });

        } catch (error) {
            logger.error('Error obtenint tags:', { error: error.message, stack: error.stack });
            
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: null
            });
        }
    }
};

module.exports = tagsController;