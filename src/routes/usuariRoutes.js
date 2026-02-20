// src/routes/usuariRoutes.js
const express = require('express');
const router = express.Router();
const usuariController = require('../controllers/usuariController');
const authTokenMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/usuaris/registrar:
 *   post:
 *     summary: Registrar un nou usuari (envia SMS amb codi)
 */
router.post('/registrar', usuariController.registrar);

/**
 * @swagger
 * /api/usuaris/validar:
 *   post:
 *     summary: Validar usuari amb codi SMS
 */
router.post('/validar', usuariController.validar);

/**
 * @swagger
 * /api/usuaris/perfil:
 *   get:
 *     summary: Obtenir perfil de l'usuari
 *     security:
 *       - BearerAuth: []
 */
router.get('/perfil', authTokenMiddleware, usuariController.perfil);

/**
 * @swagger
 * /api/usuaris/revalidar:
 *   post:
 *     summary: Regenerar API_KEY (si es perd)
 */
router.post('/revalidar', usuariController.revalidar);

module.exports = router;