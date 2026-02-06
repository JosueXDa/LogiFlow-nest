#!/usr/bin/env node

/**
 * Script para limpiar todas las bases de datos de LogiFlow
 * Elimina todos los datos de todas las tablas manteniendo la estructura
 */

import { Client } from 'pg';

// Configuración de bases de datos
const databases = [
  { name: 'auth_db', port: 5432, description: 'Auth Service' },
  { name: 'pedidos_db', port: 5433, description: 'Pedidos Service' },
  { name: 'fleet_db', port: 5434, description: 'Fleet Service' },
  { name: 'inventory_db', port: 5435, description: 'Inventory Service' },
  { name: 'billing_db', port: 5436, description: 'Billing Service' },
  { name: 'tracking_db', port: 5437, description: 'Tracking Service' },
];

const config = {
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
};

let totalCleaned = 0;
const errors = [];

console.log('\n🧹 Limpiando todas las bases de datos de LogiFlow...\n');

async function clearDatabase(dbConfig) {
  const client = new Client({
    ...config,
    database: dbConfig.name,
    port: dbConfig.port,
  });

  try {
    console.log(`📦 Procesando: ${dbConfig.description} (${dbConfig.name})`);
    await client.connect();

    // Obtener todas las tablas
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `);

    if (tablesResult.rows.length === 0) {
      console.log('  ℹ️  No hay tablas en esta base de datos\n');
      return;
    }

    console.log(`  📋 Tablas encontradas: ${tablesResult.rows.length}`);

    // Truncar todas las tablas y resetear secuencias
    await client.query(`
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        -- Deshabilitar triggers temporalmente
        SET session_replication_role = 'replica';
        
        -- Truncar todas las tablas
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'TRUNCATE TABLE public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
        
        -- Rehabilitar triggers
        SET session_replication_role = 'origin';
        
        -- Resetear secuencias (auto-increment)
        FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
          EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' RESTART WITH 1';
        END LOOP;
      END $$;
    `);

    console.log(`  ✅ ${tablesResult.rows.length} tabla(s) limpiada(s)\n`);
    totalCleaned += tablesResult.rows.length;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}\n`);
    errors.push(`${dbConfig.description}: ${error.message}`);
  } finally {
    await client.end();
  }
}

// Función para limpiar RabbitMQ
async function clearRabbitMQ() {
  console.log('🐰 Limpiando colas de RabbitMQ...');
  
  try {
    const response = await fetch('http://localhost:15672/api/queues', {
      headers: {
        'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64')
      }
    });
    
    if (!response.ok) {
      console.log('  ⚠️  No se pudo conectar a RabbitMQ Management API\n');
      return;
    }
    
    const queues = await response.json();
    
    for (const queue of queues) {
      try {
        const purgeResponse = await fetch(
          `http://localhost:15672/api/queues/%2F/${queue.name}/contents`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': 'Basic ' + Buffer.from('admin:admin').toString('base64')
            }
          }
        );
        
        if (purgeResponse.ok) {
          console.log(`  ✅ Cola '${queue.name}' purgada`);
        }
      } catch (err) {
        // Ignorar errores individuales de colas
      }
    }
  } catch (error) {
    console.log('  ⚠️  RabbitMQ no está disponible o no se pudo limpiar\n');
  }
}

// Ejecutar limpieza
(async () => {
  try {
    // Limpiar todas las bases de datos
    for (const db of databases) {
      await clearDatabase(db);
    }

    // Limpiar RabbitMQ
    await clearRabbitMQ();

    // Resumen final
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('                        RESUMEN FINAL                          ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (errors.length === 0) {
      console.log('✅ ÉXITO: Todas las bases de datos fueron limpiadas');
      console.log(`📊 Total de tablas limpiadas: ${totalCleaned}`);
    } else {
      console.log('⚠️  COMPLETADO CON ERRORES');
      console.log(`📊 Tablas limpiadas: ${totalCleaned}`);
      console.log(`❌ Errores encontrados: ${errors.length}\n`);
      console.log('Detalles de errores:');
      errors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log('\n💡 Nota: Las estructuras de las tablas se mantienen intactas.');
    console.log('   Solo se eliminaron los datos.\n');
    console.log('🔄 Puedes ejecutar los scripts de seed para repoblar:');
    console.log('   node scripts/seed-fleet.mjs');
    console.log('   node scripts/seed-inventory.mjs\n');
  } catch (error) {
    console.error('❌ Error crítico:', error.message);
    process.exit(1);
  }
})();
