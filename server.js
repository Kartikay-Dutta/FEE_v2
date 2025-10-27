const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const config = require('./config/config');

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '230378',
    database: 'weathernow_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

// User Routes
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            
            const [result] = await conn.execute(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );
            
            await conn.execute(
                'INSERT INTO user_preferences (user_id) VALUES (?)',
                [result.insertId]
            );
            
            await conn.commit();
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn
        });

        res.json({ token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Favorites Routes
app.get('/api/favorites', authenticateToken, async (req, res) => {
    try {
        const [favorites] = await pool.execute(
            'SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC',
            [req.user.id]
        );
        res.json(favorites);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
    try {
        const { city_name, country_code } = req.body;
        await pool.execute(
            'INSERT INTO favorites (user_id, city_name, country_code) VALUES (?, ?, ?)',
            [req.user.id, city_name, country_code]
        );
        res.status(201).json({ message: 'Favorite added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/favorites/:city', authenticateToken, async (req, res) => {
    try {
        await pool.execute(
            'DELETE FROM favorites WHERE user_id = ? AND city_name = ?',
            [req.user.id, req.params.city]
        );
        res.json({ message: 'Favorite removed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// User Preferences Routes
app.get('/api/preferences', authenticateToken, async (req, res) => {
    try {
        const [prefs] = await pool.execute(
            'SELECT * FROM user_preferences WHERE user_id = ?',
            [req.user.id]
        );
        res.json(prefs[0] || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/preferences', authenticateToken, async (req, res) => {
    try {
        const { default_unit, theme } = req.body;
        await pool.execute(
            'UPDATE user_preferences SET default_unit = ?, theme = ? WHERE user_id = ?',
            [default_unit, theme, req.user.id]
        );
        res.json({ message: 'Preferences updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});