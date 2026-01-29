import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  try {
    const { email } = JSON.parse(event.body || '{}');

    if (!email) {
      return {
        statusCode: 400,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ message: "Email is required" }),
      };
    }

    const result = await pool.query(
      'SELECT id, email, zip_code as "zipCode" FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 401,
        headers: { 
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: "mock_token_" + Date.now(),
        user: result.rows[0]
      }),
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};