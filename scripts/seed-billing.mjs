import pg from 'pg';

const { Pool } = pg;

// Configuración de la base de datos de billing
const billingPool = new Pool({
    host: 'localhost',
    port: 5436,
    database: 'billing_db',
    user: 'postgres',
    password: 'postgres',
});

async function seedBilling() {
    const client = await billingPool.connect();
    
    try {
        console.log('📊 Creando tarifas en billing_db...\n');

        const tarifas = [
            {
                tipoEntrega: 'URBANA',
                tipoVehiculo: 'MOTORIZADO',
                nombre: 'Urbana Motorizado',
                descripcion: 'Entrega rápida en moto dentro de la ciudad',
                tarifaBase: 2.50,
                costoPorKm: 0.50,
                costoMinimo: 2.50,
                kmIncluidos: 3,
                tarifaUrgente: 1.50,
                activa: true,
            },
            {
                tipoEntrega: 'URBANA',
                tipoVehiculo: 'VEHICULO_LIVIANO',
                nombre: 'Urbana Vehículo Liviano',
                descripcion: 'Entrega en auto/furgoneta dentro de la ciudad',
                tarifaBase: 5.00,
                costoPorKm: 0.80,
                costoMinimo: 5.00,
                kmIncluidos: 3,
                tarifaUrgente: 3.00,
                activa: true,
            },
            {
                tipoEntrega: 'INTERMUNICIPAL',
                tipoVehiculo: 'CAMION',
                nombre: 'Intermunicipal Camión',
                descripcion: 'Transporte de carga entre ciudades cercanas',
                tarifaBase: 50.00,
                costoPorKm: 1.20,
                costoPorKg: 0.10,
                costoMinimo: 60.00,
                kmIncluidos: 0,
                kgIncluidos: 100,
                factorZona: 1.1,
                activa: true,
            },
        ];

        for (const tarifa of tarifas) {
            // Verificar si ya existe
            const exists = await client.query(
                'SELECT id FROM tarifas WHERE "tipoEntrega" = $1 AND "tipoVehiculo" = $2',
                [tarifa.tipoEntrega, tarifa.tipoVehiculo]
            );

            if (exists.rows.length > 0) {
                console.log(`⚠️  Tarifa ya existe: ${tarifa.nombre}`);
                continue;
            }

            // Insertar tarifa
            await client.query(
                `INSERT INTO tarifas (
                    "tipoEntrega", "tipoVehiculo", nombre, descripcion,
                    "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
                    "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
                    activa, "createdAt", "updatedAt"
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())`,
                [
                    tarifa.tipoEntrega,
                    tarifa.tipoVehiculo,
                    tarifa.nombre,
                    tarifa.descripcion,
                    tarifa.tarifaBase,
                    tarifa.costoPorKm || 0,
                    tarifa.costoPorKg || 0,
                    tarifa.costoMinimo,
                    tarifa.kmIncluidos || null,
                    tarifa.kgIncluidos || null,
                    tarifa.tarifaUrgente || null,
                    tarifa.factorZona || null,
                    tarifa.activa,
                ]
            );

            console.log(`✅ Tarifa creada: ${tarifa.nombre}`);
        }

        console.log('\n✨ Seed de Billing Service completado');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        client.release();
        await billingPool.end();
    }
}

seedBilling();
