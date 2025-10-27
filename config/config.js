module.exports = {
    database: {
        host: 'localhost',
        user: 'root',
        password: '230378',
        database: 'weathernow_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    jwt: {
        secret: 'weathernow-secret-key-2025',
        expiresIn: '24h'
    }
};