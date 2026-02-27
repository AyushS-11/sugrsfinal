const express = require('express');
const router = express.Router();
const { models: { User } } = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }).lean();

        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const { password: _, ...safeUser } = user;
        const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: '24h' });

        res.json({ user: safeUser, token });
    } catch (e) {
        res.status(500).json({ error: 'Authentication failed' });
    }
});

module.exports = router;
