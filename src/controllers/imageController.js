// src/controllers/imageController.js
const { Petition, Response } = require('../models');
const axios = require('axios');
const { logger } = require('../config/logger');

const imageController = {
    async analitzarImatge(req, res) {
        try {
            const { prompt, images, stream = false, model = 'qwen2.5vl:7b' } = req.body;

            // Validacions
            if (!prompt || !images || !Array.isArray(images) || images.length === 0) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falten camps obligatoris: prompt i images (array amb almenys 1 imatge)'
                });
            }

            // ⚠️ De moment no requerim autenticació (punt 10 especifica)
            // Quan s'integri: const userId = req.userId;
            const userId = 1; // Temporal per proves

            // 1. Guardar la petició a la BD
            const petition = await Petition.create({
                userId,
                prompt,
                images: JSON.stringify(images), // Guardem array com a TEXT
                model
            });

            // 2. Preparar dades per marIA (IETI Cloud Ollama)
            const marIARequest = {
                model,
                prompt: this.buildPrompt(prompt, images[0]), // Funció auxiliar
                stream,
                images: [images[0]] // Ollama espera array d'imatges base64
            };

            logger.info('Enviant petició a marIA', { model, prompt: prompt.substring(0, 50) });

            // 3. Cridar a marIA
            // IMPORTANT: Cal saber l'URL exacte del servei Ollama al IETI Cloud
            const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
            
            const startTime = Date.now();
            
            let ollamaResponse;
            try {
                ollamaResponse = await axios.post(ollamaUrl, marIARequest, {
                    timeout: 30000 // 30 segons per processar imatge
                });
            } catch (ollamaError) {
                logger.error('Error en connexió amb marIA', { 
                    error: ollamaError.message,
                    url: ollamaUrl 
                });
                
                // Guardar resposta d'error a la BD
                await Response.create({
                    petitionId: petition.id,
                    status: 'ERROR',
                    message: 'No s\'ha pogut connectar amb marIA',
                    data: { error: ollamaError.message }
                });

                return res.status(503).json({
                    status: 'ERROR',
                    message: 'Servei d\'anàlisi d\'imatges no disponible',
                    data: { error: 'marIA connection failed' }
                });
            }

            const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

            // 4. Processar resposta de marIA
            // Ollama pot retornar stream o resposta completa
            let description = '';
            let tags = [];

            if (stream) {
                // Si és stream, processar línia per línia
                // (Implementació simplificada - assumim resposta completa)
                description = ollamaResponse.data.response || 'Descripció no disponible';
            } else {
                description = ollamaResponse.data.response || ollamaResponse.data.message || 'Sense descripció';
            }

            // Extraure tags de la descripció (funció auxiliar)
            tags = this.extractTags(description);

            // 5. Guardar resposta a la BD
            const responseRecord = await Response.create({
                petitionId: petition.id,
                status: 'OK',
                message: 'Imatge analitzada correctament',
                data: {
                    description,
                    tags,
                    processing_time: processingTime,
                    model_used: model
                }
            });

            // 6. Retornar resposta
            return res.status(200).json({
                status: 'OK',
                message: 'Imatges processades correctament',
                data: {
                    description,
                    tags,
                    processing_time: processingTime,
                    model_used: model
                }
            });

        } catch (error) {
            logger.error('Error en analitzar imatge', { error: error.message, stack: error.stack });
            
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor',
                data: { error: error.message }
            });
        }
    },

    // Funció auxiliar per construir el prompt per marIA
    buildPrompt(userPrompt, imageBase64) {
        // Optimitzat per qwen2.5vl
        return `[INST] ${userPrompt} [/INST]`;
    },

    // Funció auxiliar per extraure tags
    extractTags(description) {
        // Versió inicial: retornar tags buits o generar-ne de bàsics
        // En futura iteració: cridar a marIA específicament per tags
        const words = description.toLowerCase().split(/\W+/);
        const commonWords = ['a', 'el', 'la', 'els', 'les', 'un', 'una', 'i', 'o', 'però', 'amb'];
        const tags = [...new Set(words)]
            .filter(word => word.length > 3 && !commonWords.includes(word))
            .slice(0, 5);
        
        return tags;
    }
};

module.exports = imageController;