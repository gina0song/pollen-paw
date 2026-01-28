import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log("DB_CONNECT_DEBUG: SSL Enabled");

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
 // For AWS RDS with self-signed certificates
  ssl: {
    rejectUnauthorized: false
  }
});

console.log("LOG_CHECK: Connection Pool initialized with SSL!"); // Debug log

// Handle unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);