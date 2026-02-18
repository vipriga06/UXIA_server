const express = require('express');
const router = express.Router();
const mariaService = require('../services/mariaService');

// GET /api/maria/models - Llistar models
router.get('/models', async (req, res) => {
    try {
        const models = await mariaService.listModels();
        res.json({ 
            status: 'OK', 
            user: 'uxia3',
            data: models 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            user: 'uxia3',
            message: error.message 
        });
    }
});

// POST /api/maria/generate - Generar text
router.post('/generate', async (req, res) => {
    try {
        const { model = 'llama2', prompt, ...options } = req.body;
        if (!prompt) {
            return res.status(400).json({ 
                status: 'ERROR', 
                message: 'El prompt és obligatori' 
            });
        }
        const result = await mariaService.generate(model, prompt, options);
        res.json({ 
            status: 'OK', 
            user: 'uxia3',
            data: result 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            user: 'uxia3',
            message: error.message 
        });
    }
});

module.exports = router;