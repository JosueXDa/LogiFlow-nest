/**
 * Script para migrar los IDs de usuarios de Better Auth de strings alfanuméricos a UUIDs
 * Ejecutar: bun scripts/migrate-auth-to-uuid.mjs
 */

import pg from 'pg';
import { randomUUID } from 'crypto';

const { Pool } = pg;

// Configuración de conexión a auth_db
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'auth_db',
});

async function migrateToUUID() {
  const client = await pool.connect();

  try {
    console.log('🔄 Iniciando migración de IDs a UUID...\n');

    await client.query('BEGIN');

    // 1. Obtener todos los usuarios actuales ANTES de hacer cambios
    const usersResult = await client.query('SELECT * FROM "user"');
    const users = usersResult.rows;
    console.log(`📊 Encontrados ${users.length} usuarios para migrar`);

    // 2. Crear mapeo de IDs antiguos a nuevos UUIDs
    const userMapping = new Map();
    for (const user of users) {
      const newId = randomUUID();
      userMapping.set(user.id, newId);
      console.log(`  🔑 ${user.email}: ${user.id} → ${newId}`);
    }

    // 3. ELIMINAR todas las sesiones (de todas formas se invalidan)
    console.log('\n🧹 Eliminando todas las sesiones (serán recreadas al hacer login)...');
    await client.query('DELETE FROM session');

    // 4. Verificar si existe la tabla verification y limpiarla
    const verificationExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'verification'
      );
    `);
    
    if (verificationExists.rows[0].exists) {
      console.log('🧹 Eliminando verificaciones...');
      await client.query('DELETE FROM verification');
    } else {
      console.log('  ℹ️  Tabla verification no existe, omitiendo...');
    }

    // 5. Eliminar todas las accounts (se recrean en el próximo login)
    console.log('🧹 Eliminando cuentas (se recrearán al hacer login)...');
    await client.query('DELETE FROM account');

    // 6. Actualizar los IDs de usuarios (ahora sin restricciones)
    console.log('🔄 Actualizando IDs de usuarios...');
    for (const [oldId, newId] of userMapping.entries()) {
      await client.query('UPDATE "user" SET id = $1 WHERE id = $2', [
        newId,
        oldId,
      ]);
    }

    // 7. Cambiar el tipo de columna a UUID (ALTER TABLE)
    console.log('\n🔧 Modificando esquema de base de datos...');
    
    // Paso 1: Eliminar restricciones de clave foránea temporalmente
    console.log('  🔓 Eliminando restricciones de clave foránea temporalmente...');
    await client.query('ALTER TABLE session DROP CONSTRAINT IF EXISTS "FK_3d2f174ef04fb312fdebd0ddc53"');
    await client.query('ALTER TABLE account DROP CONSTRAINT IF EXISTS "FK_60328bf27019ff5498c4b977421"');
    
    // Paso 2: Cambiar todos los tipos de columna a UUID
    console.log('  📝 Modificando user.id a UUID...');
    await client.query('ALTER TABLE "user" ALTER COLUMN id TYPE uuid USING id::uuid');
    
    console.log('  📝 Modificando session.userId a UUID...');
    await client.query('ALTER TABLE session ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid');
    
    console.log('  📝 Modificando account.userId a UUID...');
    await client.query('ALTER TABLE account ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid');
    
    // Actualizar verification solo si existe
    if (verificationExists.rows[0].exists) {
      const hasUserIdColumn = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'verification'
          AND column_name = 'userId'
        );
      `);
      
      if (hasUserIdColumn.rows[0].exists) {
        console.log('  📝 Modificando verification.userId a UUID...');
        await client.query('ALTER TABLE verification ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid');
      }
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

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📋 Nuevos IDs de usuarios:');
    
    const newUsers = await client.query('SELECT id, email, role FROM "user"');
    for (const user of newUsers.rows) {
      console.log(`  👤 ${user.email} (${user.role}): ${user.id}`);
    }

    console.log('\n⚠️  IMPORTANTE: Actualiza tu cookie de sesión haciendo login nuevamente');
    console.log('   Las sesiones antiguas se invalidaron durante la migración.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

migrateToUUID().catch(console.error);
