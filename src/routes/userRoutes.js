const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', userController.getUserById);

// POST /api/users - Crear nuevo usuario
router.post('/', userController.createUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Registrar usuario y generar API Key
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 example: SparkleFuzzMcGee
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               telefon:
 *                 type: string
 *                 example: "+34 600 000 000"
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
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
 *                   example: L'usuari s'ha creat correctament
 *                 data:
 *                   type: object
 *                   properties:
 *                     nickname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     api_key:
 *                       type: string
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Email ya registrado
 */
router.post('/login', userController.loginUser);


module.exports = router;