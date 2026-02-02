const { User } = require('../models');

const userController = {
    async getAllUsers(req, res) {
        try {
            const users = await User.findAll({
                attributes: ['id', 'nickname', 'email', 'role', 'createdAt']
            });
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async getUserById(req, res) {
        try {
            const user = await User.findByPk(req.params.id, {
                attributes: ['id', 'nickname', 'email', 'role', 'createdAt']
            });
            
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    
    async createUser(req, res) {
        try {
            const { nickname, email, password, role } = req.body;
            
            const user = await User.create({
                nickname,
                email,
                passwordHash: password, // En producción usarías bcrypt
                role: role || 'user'
            });
            
            res.status(201).json({
                id: user.id,
                nickname: user.nickname,
                email: user.email,
                role: user.role
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = userController;