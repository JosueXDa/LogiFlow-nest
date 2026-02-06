/**
 * Script para listar usuarios UUID de auth_db
 * Ejecutar: node scripts/list-users.mjs
 */

import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'auth_db',
});

async function listUsers() {
  const client = await pool.connect();

  try {
    console.log('📋 Usuarios en auth_db:\n');

    const result = await client.query(
      'SELECT id, email, name, role, "emailVerified", "createdAt" FROM "user" ORDER BY "createdAt" ASC'
    );

    if (result.rows.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos\n');
      return;
    }

    result.rows.forEach((user, index) => {
      console.log(`👤 Usuario ${index + 1}:`);
      console.log(`   ID (UUID): ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name || 'N/A'}`);
      console.log(`   Role: ${user.role || 'cliente'}`);
      console.log(`   Email Verified: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    console.log(`\n📊 Total: ${result.rows.length} usuarios`);
    
    const admins = result.rows.filter(u => u.role === 'ADMIN');
    if (admins.length > 0) {
      console.log(`\n🔑 Usuarios ADMIN disponibles:`);
      admins.forEach(admin => {
        console.log(`   ${admin.email} → UUID: ${admin.id}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

listUsers().catch(console.error);
