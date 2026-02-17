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

            // 🔧 CONVERTIR EL QUE ENVIA KOTLIN A ARRAY (TOTS ELS CASOS)
            let imagesArray = [];
            
            // CAS 1: Ja és un array
            if (Array.isArray(imagesData)) {
                imagesArray = imagesData;
                console.log('✅ CAS 1: És un array directe');
            } 
            // CAS 2: És un string JSON (el cas de Kotlin)
            else if (typeof imagesData === 'string') {
                try {
                    imagesArray = JSON.parse(imagesData);
                    console.log('✅ CAS 2: String JSON parsejat correctament');
                    
                    // Comprovar que després del parse és un array
                    if (!Array.isArray(imagesArray)) {
                        // Si no és array, el convertim
                        imagesArray = [imagesArray];
                    }
                } catch (parseError) {
                    console.log('❌ Error parsejant JSON, tractant com a string pla');
                    // Si no es pot parsejar, potser és una base64 sola
                    imagesArray = [imagesData];
                }
            } 
            // CAS 3: És un objecte (per si de cas)
            else if (typeof imagesData === 'object' && imagesData !== null) {
                imagesArray = Object.values(imagesData);
                console.log('✅ CAS 3: Objecte convertit a array');
            }

            // VALIDACIÓ FINAL: Comprovar que tenim almenys una imatge
            if (!imagesArray || imagesArray.length === 0) {
                console.log('❌ No s\'ha rebut cap imatge després de la conversió');
                return res.status(400).json({
                    status: 'ERROR',
                    message: 'No s\'ha rebut cap imatge',
                    data: null
                });
            }

            console.log('✅ Imatges rebudes:', imagesArray.length);
            console.log('✅ Primera imatge (length):', imagesArray[0]?.length || 0);

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
            const tags = ["prova", "aleatori", "test"];

            // 2. Guardar resposta a la BD
            await Response.create({
                petitionId: petition.id,
                status: 'OK',
                message: 'Imatge analitzada correctament (MOCK)',
                data: {
                    description,
                    tags,
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
                    tags: tags,
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