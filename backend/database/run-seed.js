const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function runSeed() {
  try {
    console.log('🌱 Seeding database...');
    
    const seedSQL = fs.readFileSync(
      path.join(__dirname, 'seed.sql'),
      'utf-8'
    );
    
    await pool.query(seedSQL);
    
    console.log('✅ Database seeded successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
