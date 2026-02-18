// src/controllers/imageController.js
const { Petition, Response } = require('../models');
const { logger } = require('../config/logger');
const fetch = require('node-fetch');

const imageController = {
    async analitzarImatge(req, res) {
        try {
            console.log('🔵 PAS 1: Iniciant anàlisi');
            
            // ✅ LA APP ENVIA "imatges" (en plural)
            let imagesData = req.body.imatges;
            let prompt = req.body.prompt || "Què hi ha en aquesta imatge?";
            let model = req.body.model || 'qwen2.5vl:7b';

            console.log('🔵 PAS 2: Dades rebudes:', { 
                teImages: !!imagesData, 
                prompt, 
                model,
                tipusImages: typeof imagesData 
            });

            // Validar que tenim imatges
            if (!imagesData) {
                console.log('🔴 ERROR: No hi ha imatges');
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'Falten camps obligatoris: imatges',
                    data: null
                });
            }

            // Convertir a array
            let imagesArray = [];
            
            if (Array.isArray(imagesData)) {
                imagesArray = imagesData;
                console.log('🔵 PAS 3: És array directe, longitud:', imagesArray.length);
            } else if (typeof imagesData === 'string') {
                console.log('🔵 PAS 3: És string, intentant parsejar');
                try {
                    imagesArray = JSON.parse(imagesData);
                    console.log('🔵 PAS 4: Parsejat correctament, longitud:', imagesArray.length);
                } catch (e) {
                    console.log('🔵 PAS 4: No és JSON, tractant com a string pla');
                    imagesArray = [imagesData];
                }
            }

            if (!imagesArray || imagesArray.length === 0) {
                console.log('🔴 ERROR: Array buit');
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'No s\'ha rebut cap imatge',
                    data: null
                });
            }

            console.log('🔵 PAS 5: ImagesArray OK, primera imatge length:', imagesArray[0]?.length);

            const userId = req.userId;
            const startTime = Date.now();

            // 1. Guardar la petició a la BD
            console.log('🔵 PAS 6: Guardant petició a BD');
            const petition = await Petition.create({
                userId,
                prompt,
                images: JSON.stringify(imagesArray),
                model
            });
            console.log('🔵 PAS 7: Petició guardada, ID:', petition.id);

            // PROMPT PER OLLAMA
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
            console.log('🔵 PAS 8: Preparant crida a Ollama');
            
            const ollamaUrl = 'http://192.168.1.24:11434/api/generate'; // Directa
            
            const requestBody = {
                model: model,
                prompt: OLLAMA_PROMPT,
                images: [imagesArray[0]], // ✅ CORRECTE
                stream: false
            };

            console.log('🔵 PAS 9: Enviant a Ollama:', {
                url: ollamaUrl,
                model: requestBody.model,
                promptLength: requestBody.prompt.length,
                imageLength: requestBody.images[0]?.length
            });

            let ollamaResponse;
            try {
                console.log('🔵 PAS 10: Fent fetch...');
                const response = await fetch(ollamaUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    timeout: 30000
                });

                console.log('🔵 PAS 11: Resposta rebuda, status:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                const data = await response.json();
                console.log('🔵 PAS 12: JSON parsejat, té response?', !!data?.response);
                
                if (!data || !data.response) {
                    throw new Error('Unexpected Ollama response format');
                }

                ollamaResponse = data.response;
                console.log('🔵 PAS 13: Ollama response (primeres 100 chars):', ollamaResponse.substring(0, 100));
                
            } catch (ollamaError) {
                console.log('🔴 ERROR EN OLLAMA:', ollamaError.message);
                console.log('🔴 STACK:', ollamaError.stack);
                
                logger.error('Error en connexió amb Ollama:', { 
                    error: ollamaError.message,
                    url: ollamaUrl 
                });
                
                // Fallback a mock
                const mockDescription = "Aquesta és una descripció de prova (fallback)";
                const mockTags = ["prova", "fallback", "test"];
                
                await Response.create({
                    petitionId: petition.id,
                    status: 'OK',
                    message: 'Imatge analitzada correctament (MOCK)',
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

            // 3. Processar resposta
            console.log('🔵 PAS 14: Processant resposta');
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
                    console.log('🔵 PAS 15: JSON parsejat, description:', description.substring(0, 50));
                } else {
                    console.log('🔵 PAS 15: No s\'ha trobat JSON, usant resposta sencera');
                    description = ollamaResponse;
                    tags = [];
                }
            } catch (parseError) {
                console.log('🔴 ERROR PARSING:', parseError.message);
                description = ollamaResponse;
                tags = [];
            }

            // 4. Guardar resposta
            console.log('🔵 PAS 16: Guardant a BD');
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

            // 5. Retornar
            console.log('🔵 PAS 17: Retornant resposta');
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
            console.log('🔴 ERROR GENERAL:', error);
            console.log('🔴 MISSATGE:', error.message);
            console.log('🔴 STACK:', error.stack);
            
            logger.error('Error en analitzar imatge:', { 
                error: error.message, 
                stack: error.stack 
            });
            
            return res.status(500).json({
                status: 'ERROR',
                message: 'Error intern del servidor: ' + error.message,
                data: null
            });
        }
    }
};

module.exports = imageController;