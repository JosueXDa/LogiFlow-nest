/**
 * Script para revertir auth_db de UUIDs a IDs alfanuméricos (text)
 * Ejecutar: node scripts/revert-auth-to-text.mjs
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

async function revertToText() {
  const client = await pool.connect();

  try {
    console.log('🔄 Revirtiendo IDs de UUID a text...\n');

    await client.query('BEGIN');

    // Paso 1: Eliminar restricciones de clave foránea temporalmente
    console.log('  🔓 Eliminando restricciones de clave foránea...');
    await client.query('ALTER TABLE session DROP CONSTRAINT IF EXISTS "FK_3d2f174ef04fb312fdebd0ddc53"');
    await client.query('ALTER TABLE account DROP CONSTRAINT IF EXISTS "FK_60328bf27019ff5498c4b977421"');
    
    // Paso 2: Cambiar todos los tipos de columna a text
    console.log('  📝 Modificando user.id a text...');
    await client.query('ALTER TABLE "user" ALTER COLUMN id TYPE text USING id::text');
    
    console.log('  📝 Modificando session.userId a text...');
    await client.query('ALTER TABLE session ALTER COLUMN "userId" TYPE text USING "userId"::text');
    
    console.log('  📝 Modificando account.userId a text...');
    await client.query('ALTER TABLE account ALTER COLUMN "userId" TYPE text USING "userId"::text');
    
    // Verificar si existe la tabla verification con columna userId
    const verificationExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'verification'
        AND column_name = 'userId'
      );
    `);
    
    if (verificationExists.rows[0].exists) {
      console.log('  📝 Modificando verification.userId a text...');
      await client.query('ALTER TABLE verification ALTER COLUMN "userId" TYPE text USING "userId"::text');
    }
    
    // Paso 3: Recrear las restricciones de clave foránea
    console.log('  🔒 Recreando restricciones de clave foránea...');
    await client.query(`
      ALTER TABLE session 
      ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" 
      FOREIGN KEY ("userId") REFERENCES "user"(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);
    
    await client.query(`
      ALTER TABLE account 
      ADD CONSTRAINT "FK_60328bf27019ff5498c4b977421" 
      FOREIGN KEY ("userId") REFERENCES "user"(id) 
      ON DELETE CASCADE ON UPDATE CASCADE
    `);

    await client.query('COMMIT');

    console.log('\n✅ Reversión completada exitosamente!');
    console.log('   Todos los IDs ahora son text (IDs alfanuméricos de Better Auth)');
    
    // Mostrar usuarios
    const users = await client.query('SELECT id, email, role FROM "user" LIMIT 5');
    if (users.rows.length > 0) {
      console.log('\n📋 Usuarios (primeros 5):');
      users.rows.forEach(user => {
        console.log(`  👤 ${user.email} (${user.role || 'cliente'}): ${user.id}`);
      });
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error durante la reversión:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

revertToText().catch(console.error);
