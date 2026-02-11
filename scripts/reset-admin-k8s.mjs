import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: 'postgresql://postgres:postgres@localhost:5440/auth_db'
});

const auth = betterAuth({
    database: pool,
    emailAndPassword: {
        enabled: true
    }
});

async function resetPassword() {
    try {
        console.log('🔄 Reseteando contraseña para admin@test.com...');

        // Buscar usuario
        const result = await pool.query("SELECT id FROM \"user\" WHERE email = 'admin@test.com'");

        if (result.rows.length === 0) {
            console.log('❌ Usuario no encontrado');
            process.exit(1);
        }

        const userId = result.rows[0].id;

        // Hashear password usando better-auth internal (o actualizando directamete si better-auth expone hash)
        // Better auth guarda el password en la tabla account

        // Como better-auth no expone facilmente el hasher fuera del contexto, 
        // vamos a usar la API de better-auth para hacer un sign-up falso o update si fuera posible,
        // pero dado que estamos en un script aislado, lo mejor es borrar el usuario y recrearlo

        console.log('🗑️ Eliminando usuario existente...');
        await pool.query('DELETE FROM session WHERE "userId" = $1', [userId]);
        await pool.query('DELETE FROM account WHERE "userId" = $1', [userId]);
        await pool.query('DELETE FROM "user" WHERE id = $1', [userId]);

        console.log('✨ Creando usuario nuevo con Better Auth...');

        const user = await auth.api.signUpEmail({
            body: {
                email: 'admin@test.com',
                password: 'Test123!',
                name: 'Admin Test',
                role: 'ADMIN' // Custom field
            }
        });

        if (user) {
            console.log('✅ Usuario admin@test.com recreado exitosamente');
            console.log('🔑 Password: Test123!');

            // Asegurar rol ADMIN
            await pool.query("UPDATE \"user\" SET role = 'ADMIN' WHERE email = 'admin@test.com'");
            console.log('👮 Rol ADMIN asignado');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

resetPassword();
