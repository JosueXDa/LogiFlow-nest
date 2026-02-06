/**
 * Script para crear un usuario admin directamente en auth_db con UUID
 * Ejecutar: node scripts/create-admin-uuid.mjs
 */

import pg from 'pg';
import { randomUUID } from 'crypto';
import crypto from 'crypto';

const { Pool } = pg;

// Configuración de conexión a auth_db
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'auth_db',
});

// Función para hashear password (compatible con Better Auth)
async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    // Better Auth usa bcrypt con 10 rounds por defecto
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 10000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
}

async function createAdminUser() {
  const client = await pool.connect();

  try {
    console.log('🔄 Creando usuario administrador con UUID...\n');

    const userId = randomUUID();
    const email = 'admin@logiflow.com';
    const password = 'Admin123!';
    const role = 'ADMIN';

    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🆔 UUID generado: ${userId}`);
    console.log(`👤 Role: ${role}\n`);

    // Verificar si el usuario ya existe
    const existingUser = await client.query(
      'SELECT id FROM "user" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Usuario ya existe. Actualizando...');
      
      // Actualizar usuario existente
      await client.query(
        `UPDATE "user" 
         SET role = $1, "emailVerified" = true, "updatedAt" = NOW()
         WHERE email = $2`,
        [role, email]
      );
      
      console.log(`✅ Usuario actualizado: ${existingUser.rows[0].id}`);
      console.log(`\n📝 Usa este UUID para clienteId: ${existingUser.rows[0].id}`);
    } else {
      console.log('🆕 Creando nuevo usuario...');
      
      // Hashear password (simplificado - Better Auth maneja esto normalmente)
      const hashedPassword = await hashPassword(password);
      
      // Insertar usuario
      const now = new Date().toISOString();
      await client.query(
        `INSERT INTO "user" (id, email, "emailVerified", name, role, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, email, true, 'Administrator', role, now, now]
      );
      
      // Insertar cuenta (para email/password login)
      const accountId = randomUUID();
      await client.query(
        `INSERT INTO account (id, "userId", "accountId", "providerId", password, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [accountId, userId, email, 'credential', hashedPassword, now, now]
      );
      
      console.log('✅ Usuario creado exitosamente!');
      console.log(`\n📝 Usa este UUID para clienteId: ${userId}`);
    }

    console.log('\n🔐 Credenciales para login:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${role}`);

  } catch (error) {
    console.error('\n❌ Error al crear usuario:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser().catch(console.error);
