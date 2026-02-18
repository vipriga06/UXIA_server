// src/routes/usuariRoutes.js
const express = require('express');
const router = express.Router();
const usuariController = require('../controllers/usuariController');
const authTokenMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/usuaris/registrar:
 *   post:
 *     summary: Registrar un nou usuari
 *     tags: [Usuaris]
 */
router.post('/registrar', usuariController.registrar);

/**
 * @swagger
 * /api/usuaris/validar:
 *   post:
 *     summary: Validar usuari amb codi SMS
 *     tags: [Usuaris]
 */
router.post('/validar', usuariController.validar);

/**
 * @swagger
 * /api/usuaris/perfil:
 *   get:
 *     summary: Obtenir perfil de l'usuari
 *     tags: [Usuaris]
 *     security:
 *       - BearerAuth: []
 */
router.get('/perfil', authTokenMiddleware, usuariController.perfil);

module.exports = router;