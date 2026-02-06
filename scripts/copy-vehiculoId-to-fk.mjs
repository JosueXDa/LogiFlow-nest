import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'localhost',
    port: 5434,
    database: 'fleet_db',
    user: 'postgres',
    password: 'postgres',
});

async function copyVehiculoIds() {
    try {
        await client.connect();
        console.log('✅ Conectado a fleet_db\n');

        // Copiar valores de vehiculoId a vehiculo_id
        console.log('📋 Copiando vehiculoId → vehiculo_id...\n');
        
        const result = await client.query(`
            UPDATE repartidores 
            SET vehiculo_id = "vehiculoId"
            WHERE "vehiculoId" IS NOT NULL
            RETURNING nombre, vehiculo_id
        `);

        console.log(`✅ ${result.rowCount} repartidores actualizados:\n`);
        result.rows.forEach(row => {
            console.log(`   ${row.nombre}: vehiculo_id = ${row.vehiculo_id}`);
        });

        // Verificar el resultado
        console.log('\n📋 Verificando estado final:');
        const check = await client.query(`
            SELECT r.nombre, r.vehiculo_id, v.placa, v.tipo
            FROM repartidores r
            LEFT JOIN vehiculos v ON v.id = r.vehiculo_id
            WHERE r."deletedAt" IS NULL
        `);

        check.rows.forEach(row => {
            console.log(`   ${row.nombre}: vehiculo_id=${row.vehiculo_id?.substring(0, 8)}..., placa=${row.placa || 'NULL'}, tipo=${row.tipo || 'NULL'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

copyVehiculoIds();
