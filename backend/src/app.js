const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Sample API Health Check Route
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'BengkelPro REST API Server running smoothly',
        timestamp: new Date()
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 BengkelPro Backend running on http://localhost:${PORT}`);
});
