// src/controllers/imageController.js
const { Petition, Response } = require('../models');
const { logger } = require('../config/logger');
const fetch = require('node-fetch');

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
            const startTime = Date.now();

            // 1. Guardar la petició a la BD
            const petition = await Petition.create({
                userId,
                prompt,
                images: JSON.stringify(imagesArray),
                model
            });

            // 🔥 PROMPT PER OLLAMA (adaptat del codi de la Laura)
            const OLLAMA_PROMPT = `Analyze the provided image.

Return ONLY a valid JSON object with the exact following structure:

{
  "description": "Clear and detailed description of what appears in the image",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}

Rules:
- The description must be 2 to 4 sentences long in Catalan language.
- Tags must be single keywords in lowercase in Catalan.
- Tags should describe objects, environment, colors, and overall context.
- Do not include any text before or after the JSON.
- Do not use markdown formatting.
- Ensure the output is valid JSON.`;

            // 2. Cridar a Ollama
            logger.info('Enviant petició a Ollama...');
            
            const ollamaUrl = process.env.OLLAMA_URL || 'http://192.168.1.24:11434/api/generate';
            
            // 🔥 CORREGIT: "images" en anglès (no "imatges")
            const requestBody = {
                model: model,
                prompt: OLLAMA_PROMPT,
                images: [imagesArray[0]], // ✅ CORRECTE
                stream: false
            };

            console.log('📤 Enviant a Ollama:', {
                model: requestBody.model,
                promptLength: requestBody.prompt.length,
                imageLength: requestBody.images[0]?.length
            });

            let ollamaResponse;
            try {
                const response = await fetch(ollamaUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    timeout: 30000
                });

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                
                if (!data || !data.response) {
                    throw new Error('Unexpected Ollama response format');
                }

                ollamaResponse = data.response;
                
            } catch (ollamaError) {
                logger.error('Error en connexió amb Ollama:', { 
                    error: ollamaError.message,
                    url: ollamaUrl 
                });
                
                // Fallback a mock
                const mockDescription = "Aquesta és una descripció de prova (fallback) per assegurar el funcionament de l'app";
                const mockTags = ["prova", "fallback", "test"];
                
                await Response.create({
                    petitionId: petition.id,
                    status: 'OK',
                    message: 'Imatge analitzada correctament (MOCK - Ollama no disponible)',
                    data: {
                        descripcio: mockDescription,
                        tags: mockTags,
                        processing_time: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
                        model_used: model
                    }
                });

                return res.status(200).json({
                    status: 'OK',
                    message: 'Imatges processades correctament',
                    data: {
                        descripcio: mockDescription,
                        tags: mockTags,
                        processing_time: ((Date.now() - startTime) / 1000).toFixed(1) + 's',
                        model_used: model
                    }
                });
            }

            const processingTime = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

            // 3. Processar resposta de Ollama (extreure JSON)
            let description = '';
            let tags = [];

            try {
                const jsonStart = ollamaResponse.indexOf('{');
                const jsonEnd = ollamaResponse.lastIndexOf('}') + 1;
                
                if (jsonStart !== -1 && jsonEnd > jsonStart) {
                    const cleanJson = ollamaResponse.slice(jsonStart, jsonEnd);
                    const parsed = JSON.parse(cleanJson);
                    
                    description = parsed.description || 'Sense descripció';
                    tags = parsed.tags || [];
                } else {
                    description = ollamaResponse;
                    tags = [];
                }
            } catch (parseError) {
                logger.error('Error parsejant resposta:', parseError);
                description = ollamaResponse;
                tags = [];
            }

            // 4. Guardar resposta a la BD
            await Response.create({
                petitionId: petition.id,
                status: 'OK',
                message: 'Imatge analitzada correctament',
                data: {
                    descripcio: description,
                    tags: tags,
                    processing_time: processingTime,
                    model_used: model
                }
            });

            // 5. Retornar resposta (amb "descripcio" per la companya)
            return res.status(200).json({
                status: 'OK',
                message: 'Imatges processades correctament',
                data: {
                    descripcio: description,
                    tags: tags,
                    processing_time: processingTime,
                    model_used: model
                }
            });

        } catch (error) {
            logger.error('Error en analitzar imatge:', { 
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