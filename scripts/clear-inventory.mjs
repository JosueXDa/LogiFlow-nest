/**
 * Clear all products from inventory database
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

async function clearInventory() {
  const client = await pool.connect();
  
  try {
    console.log('🗑️  Clearing inventory database...\n');

    // Delete all products (CASCADE will handle related records)
    const productosResult = await client.query('TRUNCATE TABLE productos CASCADE');
    console.log(`✅ All products and related records deleted`);

    console.log('\n✅ Inventory cleared successfully!');
  } catch (error) {
    console.error('❌ Error clearing inventory:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

clearInventory().catch(console.error);
