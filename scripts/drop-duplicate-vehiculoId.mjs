import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'localhost',
    port: 5434,
    database: 'fleet_db',
    user: 'postgres',
    password: 'postgres',
});

async function dropDuplicateColumn() {
    try {
        await client.connect();
        console.log('✅ Conectado a fleet_db\n');

        // Verificar columnas actuales
        const columns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'repartidores' 
            AND column_name LIKE '%vehiculo%'
            ORDER BY column_name
        `);
        
        console.log('📋 Columnas actuales relacionadas con vehículo:');
        columns.rows.forEach(col => console.log(`   - ${col.column_name}`));

        // Eliminar columna duplicada vehiculoId
        console.log('\n🗑️  Eliminando columna vehiculoId...');
        await client.query('ALTER TABLE repartidores DROP COLUMN IF EXISTS "vehiculoId"');
        console.log('✅ Columna eliminada\n');

        // Verificar de nuevo
        const afterColumns = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'repartidores' 
            AND column_name LIKE '%vehiculo%'
            ORDER BY column_name
        `);
        
        console.log('📋 Columnas después de eliminar:');
        afterColumns.rows.forEach(col => console.log(`   - ${col.column_name}`));

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

dropDuplicateColumn();
