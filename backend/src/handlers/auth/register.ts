import { APIGatewayProxyHandler } from 'aws-lambda';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
 
  ssl: {
    rejectUnauthorized: false  
  },
  max: 1, 
  idleTimeoutMillis: 120000,
  connectionTimeoutMillis: 10000,
});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email, zip_code } = JSON.parse(event.body || '{}');

    if (!email || !zip_code) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Email and ZIP code are required" })
      };
    }

    const result = await pool.query(
      `INSERT INTO users (email, zip_code, password_hash) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO UPDATE SET zip_code = EXCLUDED.zip_code
       RETURNING id, email, zip_code`,
      [email, zip_code, 'MOCK_PASSWORD'] 
    );

    return {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(result.rows[0])
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        message: "Failed to register user",
        error: error instanceof Error ? error.message : 'Unknown error'  
      })
    };
  }
};