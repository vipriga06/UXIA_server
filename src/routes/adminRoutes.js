const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

/**
 * @swagger
 * /api/admin/usuaris/login:
 *   post:
 *     summary: Login d'usuari administrador
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuari@example.com
 *               password:
 *                 type: string
 *                 example: No "123456"
 *     responses:
 *       200:
 *         description: Usuari autenticat correctament
 *       400:
 *         description: Error de validació
 *       401:
 *         description: Credencials incorrectes
 *       403:
 *         description: Accés restringit
 */
router.post('/usuaris/login', adminController.loginAdmin);

module.exports = router;
