const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const path = require('path');

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Frontend Files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Accounts Data (Admin Only)
const ACCOUNTS = [
    { id: 'usr_1', username: 'admin', password: 'admin123', name: 'Budi Santoso (Admin)', role: 'Administrator', avatar: '👑' }
];

// API Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'BengkelPro REST API Server running smoothly',
        timestamp: new Date()
    });
});

// API Auth Login Route
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    const user = ACCOUNTS.find(a => a.username === username && a.password === password);
    
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Username atau password salah! Silakan coba lagi.'
        });
    }

    // Generate dummy session token
    const token = `token_${user.id}_${Date.now()}`;
    const { password: _, ...userWithoutPassword } = user;

    res.json({
        success: true,
        message: `Selamat datang kembali, ${user.name}!`,
        token,
        user: userWithoutPassword
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 BengkelPro Backend running on http://localhost:${PORT}`);
});
