// src/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const authTokenMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/analitzar-imatge:
 *   post:
 *     summary: Analitzar i descriure el contingut d’una imatge
 *     tags: [Images]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ImageAnalysisRequest'
 *     responses:
 *       200:
 *         description: Resultat de l’anàlisi de la imatge
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/CommonResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ImageAnalysisResponseData'
 */
router.post('/', imageController.analitzarImatge);

router.post('/', authTokenMiddleware, imageController.analitzarImatge);

module.exports = router;