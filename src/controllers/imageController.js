// src/controllers/imageController.js
const { Petition, Response } = require('../models');
const { logger } = require('../config/logger');

const imageController = {
    async analitzarImatge(req, res) {
        try {
            // ✅ LA APP ENVIA "imatges" (en plural)
            let imagesData = req.body.imatges;
            let prompt = req.body.prompt || "Què hi ha en aquesta imatge?";
            let model = req.body.model || 'qwen2.5vl:7b';

            // Validar que tenim imatges
            if (!imagesData) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falten camps obligatoris: imatges',
                    data: null
                });
            }

            // Convertir a array (Kotlin envia JSONArray com a string)
            let imagesArray = [];
            
            if (Array.isArray(imagesData)) {
                imagesArray = imagesData;
            } else if (typeof imagesData === 'string') {
                try {
                    imagesArray = JSON.parse(imagesData);
                } catch (e) {
                    imagesArray = [imagesData];
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

            // Guardar petició a BD
            const petition = await Petition.create({
                userId,
                prompt,
                images: JSON.stringify(imagesArray),
                model
            });

            // 🟢 MOCK: Valors de prova
            const processingTime = "0.5s";
            
            // 🔥 CANVI IMPORTANT: "descripcio" en català (amb 'c')
            const descripcio = "Aquesta és una descripció de prova per assegurar el funcionament de l'app i de l'endpoint";
            const tags = ["prova", "aleatori", "test"];

            // Guardar resposta a BD
            await Response.create({
                petitionId: petition.id,
                status: 'OK',
                message: 'Imatge analitzada correctament',
                data: {
                    descripcio,  // ← guardem amb 'c'
                    tags,
                    processing_time: processingTime,
                    model_used: model
                }
            });

            // 🔥 RETORNAR RESPOSTA AMB ELS NOMS QUE ELLA ESPERA
            return res.status(200).json({
                status: 'OK',
                message: 'Imatges processades correctament',
                data: {
                    descripcio: descripcio,  // ← "descripcio" (amb 'c')
                    tags: tags,
                    processing_time: processingTime,
                    model_used: model
                }
            });

        } catch (error) {
            logger.error('Error:', error);
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: null
            });
        }
    }
};

module.exports = imageController;