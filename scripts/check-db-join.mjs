import pg from 'pg';
const { Client } = pg;

const client = new Client({
    host: 'localhost',
    port: 5434,
    database: 'fleet_db',
    user: 'postgres',
    password: 'postgres',
});

async function checkJoin() {
    try {
        await client.connect();
        console.log('✅ Conectado a fleet_db\n');

        // Query exacto que usa TypeORM
        const query = `
            SELECT 
                r.id as repartidor_id,
                r.nombre,
                r.vehiculo_id,
                v.id as vehiculo_id,
                v.tipo,
                v.placa,
                v."deletedAt" as vehiculo_deleted
            FROM repartidores r
            LEFT JOIN vehiculos v ON v.id = r.vehiculo_id AND v."deletedAt" IS NULL
            WHERE r.estado = 'DISPONIBLE' AND r."deletedAt" IS NULL
        `;

        const result = await client.query(query);
        
        console.log(`📋 Resultado del JOIN (${result.rows.length} filas):\n`);
        result.rows.forEach(row => {
            console.log(`   Repartidor: ${row.nombre} (${row.repartidor_id})`);
            console.log(`   vehiculo_id FK: ${row.vehiculo_id || 'NULL'}`);
            console.log(`   Vehículo encontrado: ${row.placa || 'NULL'}`);
            console.log(`   Tipo: ${row.tipo || 'NULL'}`);
            console.log(`   deletedAt: ${row.vehiculo_deleted || 'NULL'}\n`);
        });

        // Verificar vehículos
        const vehiculos = await client.query('SELECT id, placa, tipo, "deletedAt" FROM vehiculos');
        console.log('\n📦 Vehículos en tabla vehiculos:');
        vehiculos.rows.forEach(v => {
            console.log(`   ${v.placa} (${v.id}) - tipo: ${v.tipo}, deletedAt: ${v.deletedAt || 'NULL'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await client.end();
    }
}

checkJoin();
