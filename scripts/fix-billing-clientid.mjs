import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5436,
  user: 'postgres',
  password: 'postgres',
  database: 'billing_db',
});

async function fixClientId() {
  try {
    await client.connect();
    console.log('✅ Conectado a billing_db');

    // Cambiar tipo de columna clienteId de UUID a VARCHAR
    console.log('🔄 Cambiando clienteId de UUID a VARCHAR(255)...');
    
    await client.query(`
      ALTER TABLE facturas 
      ALTER COLUMN "clienteId" TYPE VARCHAR(255) 
      USING "clienteId"::text;
    `);

    console.log('✅ Columna clienteId actualizada exitosamente');
    console.log('📋 Ahora acepta IDs alfanuméricos de Better Auth');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixClientId();
