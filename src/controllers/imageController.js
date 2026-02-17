// src/controllers/imageController.js
const { Petition, Response } = require('../models');
const { logger } = require('../config/logger');

const imageController = {
    async analitzarImatge(req, res) {
        try {
            // 🔍 LOG PER VEURE QUÈ ARRIBA
            console.log('🔍 REBUT - Body:', JSON.stringify(req.body, null, 2));

            // ✅ ADAPTACIÓ PER KOTLIN: La app envia "imatges"
            let imagesData = req.body.imatges;
            let prompt = req.body.prompt || "Què hi ha en aquesta imatge?";
            let model = req.body.model || 'qwen2.5vl:7b';

            // Validar que tenim dades d'imatges
            if (!imagesData) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falten camps obligatoris: imatges',
                    data: null
                });
            }

            // 🔧 CONVERTIR EL QUE ENVIA KOTLIN A ARRAY
            let imagesArray = [];
            
            if (typeof imagesData === 'string') {
                try {
                    imagesArray = JSON.parse(imagesData);
                } catch (parseError) {
                    return res.status(400).json({
                        status: 'ERROR',
                        message: 'El camp imatges no és un JSON vàlid',
                        data: null
                    });
                }
            }

            if (!imagesArray || imagesArray.length === 0) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'No s\'ha rebut cap imatge',
                    data: null
                });
            }

            const userId = req.userId;

            // 1. Guardar la petició a la BD
            const petition = await Petition.create({
                userId,
                prompt,
                images: JSON.stringify(imagesArray),
                model
            });

            // 🟢 MOCK: Valors de prova
            const processingTime = "0.5s";
            const description = "Aquesta és una descripció de prova per assegurar el funcionament de l'app i de l'endpoint";
            const tags = ["prova", "aleatori", "test"];  // ← AIXÒ ÉS UN JSONArray

            // 2. Guardar resposta a la BD
            await Response.create({
                petitionId: petition.id,
                status: 'OK',
                message: 'Imatge analitzada correctament (MOCK)',
                data: {
                    description,
                    tags,  // ← ES GUARDA COM A JSON
                    processing_time: processingTime,
                    model_used: model
                }
            });

            // 3. Retornar resposta
            return res.status(200).json({
                status: 'OK',
                message: 'Imatges processades correctament',
                data: {
                    description: description,
                    tags: tags,  // ← AIXÒ ÉS UN JSONArray
                    processing_time: processingTime,
                    model_used: model
                }
            });

        } catch (error) {
            logger.error('Error en analitzar imatge', { 
                error: error.message, 
                stack: error.stack 
            });
            
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: null
            });
        }
    }
};

module.exports = imageController;