// src/routes/tagsRoutes.js
const express = require('express');
const router = express.Router();
const tagsController = require('../controllers/tagsController');
const authTokenMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/tags/stats:
 *   get:
 *     summary: Obtenir tots els tags generats
 *     tags: [Tags]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Llista de tots els tags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_tags:
 *                       type: integer
 *                     unique_tags:
 *                       type: integer
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           tag:
 *                             type: string
 *                           count:
 *                             type: integer
 */
router.get('/stats', tagsController.getAllTags);

module.exports = router;