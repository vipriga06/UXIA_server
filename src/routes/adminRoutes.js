const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authTokenMiddleware = require('../middleware/authMiddleware');

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

/**
 * @swagger
 * /api/admin/usuaris/logout:
 *   post:
 *     summary: Tancar sessió d'administrador
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout correcte
 *       401:
 *         description: Token invàlid
 */
router.post('/usuaris/logout', authTokenMiddleware, adminController.logout);

router.get('/usuaris/testtoken', authTokenMiddleware, adminController.testToken);

router.get('/usuaris', authTokenMiddleware, adminController.listUsers);

router.post('/usuaris', authTokenMiddleware, adminController.createUser);

router.delete('/usuaris/:id', authTokenMiddleware, adminController.deleteUser);

router.patch('/usuaris/:id/rol', authTokenMiddleware, adminController.updateUserRole);

module.exports = router;
