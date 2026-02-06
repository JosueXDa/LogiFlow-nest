/**
 * Check tables in inventory database
 */

import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5435,
  database: 'inventory_db',
  user: 'postgres',
  password: 'postgres',
});

async function checkTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking inventory_db tables...\n');

    // List all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    if (result.rows.length === 0) {
      console.log('❌ No tables found in inventory_db!');
      console.log('📝 TypeORM synchronize might not have run yet.');
    } else {
      console.log(`✅ Found ${result.rows.length} tables:\n`);
      result.rows.forEach((row) => {
        console.log(`  - ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTables().catch(console.error);
