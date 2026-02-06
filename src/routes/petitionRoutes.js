const express = require('express');
const router = express.Router();
const petitionController = require('../controllers/petitionController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/petitions:
 *   get:
 *     summary: Obtener todas las peticiones (con paginación)
 *     tags: [Petitions]
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
 *         name: userId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de peticiones
 *   post:
 *     summary: Crear nueva petición
 *     tags: [Petitions]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               images:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       201:
 *         description: Petición creada correctamente
 *       400:
 *         description: Error de validación
 */
router.get('/', petitionController.getPetitions);
router.post('/', authMiddleware, petitionController.createPetition);

/**
 * @swagger
 * /api/petitions/me:
 *   get:
 *     summary: Obtener mis peticiones
 *     tags: [Petitions]
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
 *     responses:
 *       200:
 *         description: Mis peticiones
 */
router.get('/me', authMiddleware, petitionController.getPetitionsByUser);

/**
 * @swagger
 * /api/petitions/{id}:
 *   get:
 *     summary: Obtener petición por ID
 *     tags: [Petitions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición encontrada
 *       404:
 *         description: Petición no encontrada
 *   put:
 *     summary: Actualizar petición
 *     tags: [Petitions]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               prompt:
 *                 type: string
 *               images:
 *                 type: string
 *               model:
 *                 type: string
 *     responses:
 *       200:
 *         description: Petición actualizada
 *       404:
 *         description: Petición no encontrada
 *   delete:
 *     summary: Eliminar petición
 *     tags: [Petitions]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Petición eliminada
 *       404:
 *         description: Petición no encontrada
 */
router.get('/:id', petitionController.getPetitionById);
router.put('/:id', authMiddleware, petitionController.updatePetition);
router.delete('/:id', authMiddleware, petitionController.deletePetition);

module.exports = router;
