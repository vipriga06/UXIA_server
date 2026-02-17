// src/controllers/imageController.js
const { Petition, Response } = require('../models');
const axios = require('axios');
const { logger } = require('../config/logger');

const imageController = {
    async analitzarImatge(req, res) {
        try {
            // 🔍 LOG PER VEURE QUÈ ARRIBA (útil per depurar)
            console.log('🔍 REBUT - Body:', JSON.stringify(req.body, null, 2));
            console.log('🔍 REBUT - Headers:', req.headers);

            // ✅ ADAPTACIÓ PER KOTLIN: La app envia "imatges" (no "images")
            // I no envia "prompt" (el generarem nosaltres si cal)
            let imagesData = req.body.imatges;  // La clau que envia Kotlin
            let prompt = req.body.prompt || "Què hi ha en aquesta imatge?"; // Prompt per defecte
            let stream = req.body.stream || false;
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
            
            // CAS 1: Ja és un array (rar, però per si de cas)
            if (Array.isArray(imagesData)) {
                imagesArray = imagesData;
            } 
            // CAS 2: És un JSONArray com a string (el cas més probable)
            else if (typeof imagesData === 'string') {
                try {
                    // Kotlin envia un JSONArray, que és un string com "[...]"
                    imagesArray = JSON.parse(imagesData);
                    console.log('✅ String JSON parsejat correctament');
                } catch (parseError) {
                    console.log('❌ Error parsejant JSON:', parseError.message);
                    return res.status(400).json({
                        status: 'ERROR',
                        message: 'El camp imatges no és un JSON vàlid',
                        data: null
                    });
                }
            } 
            // CAS 3: És un objecte (per si de cas)
            else if (typeof imagesData === 'object' && imagesData !== null) {
                imagesArray = Object.values(imagesData);
            }

            // Validar que tenim almenys una imatge
            if (!imagesArray || imagesArray.length === 0) {
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'No s\'ha rebut cap imatge',
                    data: null
                });
            }

            console.log('✅ Imatges rebudes:', imagesArray.length);
            console.log('✅ Primera imatge (length):', imagesArray[0]?.length || 0);

            const userId = req.userId; // Agafa l'ID del token

            // 1. Guardar la petició a la BD
            const petition = await Petition.create({
                userId,
                prompt,
                images: JSON.stringify(imagesArray), // Guardem array com a TEXT
                model
            });

            // 2. Preparar dades per marIA (IETI Cloud Ollama)
            const marIARequest = {
                model,
                prompt: `[INST] ${prompt} [/INST]`,
                stream,
                images: [imagesArray[0]] // Ollama espera array d'imatges base64
            };

            logger.info('Enviant petició a marIA', { 
                model, 
                prompt: prompt.substring(0, 50),
                imageLength: imagesArray[0]?.length || 0
            });

            // 3. Cridar a marIA
            const ollamaUrl = process.env.OLLAMA_URL || 'http://192.168.1.24:11434/api/generate';
            
            const startTime = Date.now();
            
            let ollamaResponse;
            try {
                ollamaResponse = await axios.post(ollamaUrl, marIARequest, {
                    timeout: 30000, // 30 segons per processar imatge
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                logger.info('Resposta de marIA rebuda', { 
                    status: ollamaResponse.status,
                    time: `${Date.now() - startTime}ms`
                });
                
            } catch (ollamaError) {
                logger.error('Error en connexió amb marIA', { 
                    error: ollamaError.message,
                    url: ollamaUrl,
                    response: ollamaError.response?.data
                });
                
                // Guardar resposta d'error a la BD
                await Response.create({
                    petitionId: petition.id,
                    status: 'ERROR',
                    message: 'No s\'ha pogut connectar amb marIA',
                    data: { 
                        error: ollamaError.message,
                        details: ollamaError.response?.data
                    }
                });

                return res.status(503).json({
                    status: 'ERROR',
                    message: 'Servei d\'anàlisi d\'imatges no disponible',
                    data: null
                });
            }

            const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;

            // 4. Processar resposta de marIA
            let description = '';
            let tags = [];

            if (stream && ollamaResponse.data && typeof ollamaResponse.data === 'object') {
                // Si és stream, pot venir en múltiples línies
                // (versió simplificada)
                description = ollamaResponse.data.response || 'Descripció no disponible';
            } else {
                description = ollamaResponse.data?.response || 
                             ollamaResponse.data?.message || 
                             'Sense descripció';
            }

            // Extraure tags de la descripció
            tags = this.extractTags(description);

            // 5. Guardar resposta a la BD
            await Response.create({
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

            // 6. Retornar resposta (format esperat per l'app)
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
    },

    // Funció auxiliar per extreure tags
    extractTags(description) {
        if (!description) return [];
        
        try {
            const words = description.toLowerCase().split(/\W+/);
            const commonWords = ['a', 'el', 'la', 'els', 'les', 'un', 'una', 'i', 'o', 'però', 'amb', 'en', 'que'];
            const tags = [...new Set(words)]
                .filter(word => word.length > 3 && !commonWords.includes(word))
                .slice(0, 5);
            
            return tags;
        } catch (error) {
            logger.error('Error extraient tags:', error);
            return [];
        }
    }
};

module.exports = imageController;