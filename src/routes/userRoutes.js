const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users - Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// GET /api/users/:id - Obtener usuario por ID
router.get('/:id', userController.getUserById);

// POST /api/users - Crear nuevo usuario
router.post('/', userController.createUser);

module.exports = router;