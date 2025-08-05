require('dotenv').config();

const config = {
  db: {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'cunha',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
  },
  jwtSecret: process.env.JWT_SECRET || 'sua_jwt_secret',
  apiUrl: process.env.API_URL || 'http://34.136.172.18:4000',
};

module.exports = config;
