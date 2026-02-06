const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/responses:
 *   get:
 *     summary: Obtener todas las respuestas (admin)
 *     tags: [Responses]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de respuestas
 */
router.get('/', authMiddleware, responseController.getAllResponses);

/**
 * @swagger
 * /api/responses/petition/{petitionId}:
 *   get:
 *     summary: Obtener respuesta de una petición
 *     tags: [Responses]
 *     parameters:
 *       - in: path
 *         name: petitionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Respuesta encontrada
 *       404:
 *         description: Respuesta no encontrada
 *   post:
 *     summary: Crear respuesta para una petición
 *     tags: [Responses]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: petitionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: "completed"
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       201:
 *         description: Respuesta creada correctamente
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Petición no encontrada
 *       409:
 *         description: Ya existe una respuesta para esta petición
 *   put:
 *     summary: Actualizar respuesta
 *     tags: [Responses]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: petitionId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *     responses:
 *       200:
 *         description: Respuesta actualizada
 *       404:
 *         description: Respuesta no encontrada
 *   delete:
 *     summary: Eliminar respuesta
 *     tags: [Responses]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: petitionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Respuesta eliminada
 *       404:
 *         description: Respuesta no encontrada
 */
router.get('/petition/:petitionId', responseController.getResponseByPetition);
router.post('/petition/:petitionId', authMiddleware, responseController.createResponse);
router.put('/petition/:petitionId', authMiddleware, responseController.updateResponse);
router.delete('/petition/:petitionId', authMiddleware, responseController.deleteResponse);

module.exports = router;
