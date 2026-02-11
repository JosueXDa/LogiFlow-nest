/**
 * Script para poblar tarifas en billing_db en Kubernetes
 * Ejecutar con: node scripts/seed-billing-k8s.mjs
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const TARIFAS = [
    {
        tipoEntrega: 'URBANA',
        tipoVehiculo: 'MOTORIZADO',
        nombre: 'Urbana Motorizado',
        descripcion: 'Entrega rápida en moto dentro de la ciudad',
        tarifaBase: 2.50,
        costoPorKm: 0.50,
        costoPorKg: 0,
        costoMinimo: 2.50,
        kmIncluidos: 3,
        kgIncluidos: null,
        tarifaUrgente: 1.50,
        factorZona: null,
        activa: true,
    },
    {
        tipoEntrega: 'URBANA',
        tipoVehiculo: 'VEHICULO_LIVIANO',
        nombre: 'Urbana Vehículo Liviano',
        descripcion: 'Entrega en auto/furgoneta dentro de la ciudad',
        tarifaBase: 5.00,
        costoPorKm: 0.80,
        costoPorKg: 0,
        costoMinimo: 5.00,
        kmIncluidos: 3,
        kgIncluidos: null,
        tarifaUrgente: 3.00,
        factorZona: null,
        activa: true,
    },
    {
        tipoEntrega: 'URBANA',
        tipoVehiculo: 'CAMION',
        nombre: 'Urbana Camión',
        descripcion: 'Transporte de carga pesada dentro de la ciudad',
        tarifaBase: 15.00,
        costoPorKm: 1.50,
        costoPorKg: 0.05,
        costoMinimo: 20.00,
        kmIncluidos: 0,
        kgIncluidos: 50,
        tarifaUrgente: 5.00,
        factorZona: null,
        activa: true,
    },
    {
        tipoEntrega: 'INTERMUNICIPAL',
        tipoVehiculo: 'MOTORIZADO',
        nombre: 'Intermunicipal Motorizado',
        descripcion: 'Entrega en moto entre ciudades cercanas',
        tarifaBase: 10.00,
        costoPorKm: 0.80,
        costoPorKg: 0,
        costoMinimo: 15.00,
        kmIncluidos: 0,
        kgIncluidos: null,
        tarifaUrgente: 5.00,
        factorZona: 1.2,
        activa: true,
    },
    {
        tipoEntrega: 'INTERMUNICIPAL',
        tipoVehiculo: 'VEHICULO_LIVIANO',
        nombre: 'Intermunicipal Vehículo Liviano',
        descripcion: 'Entrega en auto entre ciudades cercanas',
        tarifaBase: 25.00,
        costoPorKm: 1.00,
        costoPorKg: 0.05,
        costoMinimo: 30.00,
        kmIncluidos: 0,
        kgIncluidos: 100,
        tarifaUrgente: 10.00,
        factorZona: 1.2,
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
        tarifaUrgente: 20.00,
        factorZona: 1.1,
        activa: true,
    },
    {
        tipoEntrega: 'NACIONAL',
        tipoVehiculo: 'VEHICULO_LIVIANO',
        nombre: 'Nacional Vehículo Liviano',
        descripcion: 'Entrega nacional en vehículo liviano',
        tarifaBase: 80.00,
        costoPorKm: 1.50,
        costoPorKg: 0.15,
        costoMinimo: 100.00,
        kmIncluidos: 0,
        kgIncluidos: 150,
        tarifaUrgente: 30.00,
        factorZona: 1.5,
        activa: true,
    },
    {
        tipoEntrega: 'NACIONAL',
        tipoVehiculo: 'CAMION',
        nombre: 'Nacional Camión',
        descripcion: 'Transporte de carga a nivel nacional',
        tarifaBase: 150.00,
        costoPorKm: 2.00,
        costoPorKg: 0.20,
        costoMinimo: 200.00,
        kmIncluidos: 0,
        kgIncluidos: 500,
        tarifaUrgente: 50.00,
        factorZona: 1.3,
        activa: true,
    },
];

async function executeSQL(sql) {
    const command = `kubectl exec -n logiflow postgres-billing-0 -- psql -U postgres -d billing_db -c "${sql.replace(/"/g, '\\"')}"`;
    try {
        const { stdout, stderr } = await execAsync(command);
        return { success: true, stdout, stderr };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function seedTarifas() {
    console.log('📊 Creando tarifas en billing_db (Kubernetes)...\n');

    for (const tarifa of TARIFAS) {
        // Verificar si ya existe
        const checkSQL = `SELECT id FROM tarifas WHERE "tipoEntrega" = '${tarifa.tipoEntrega}' AND "tipoVehiculo" = '${tarifa.tipoVehiculo}'`;
        const checkResult = await executeSQL(checkSQL);

        if (checkResult.success && checkResult.stdout.includes('1 row')) {
            console.log(`⚠️  Tarifa ya existe: ${tarifa.nombre}`);
            continue;
        }

        // Insertar tarifa
        const insertSQL = `INSERT INTO tarifas (
            "tipoEntrega", "tipoVehiculo", nombre, descripcion,
            "tarifaBase", "costoPorKm", "costoPorKg", "costoMinimo",
            "kmIncluidos", "kgIncluidos", "tarifaUrgente", "factorZona",
            activa, "createdAt", "updatedAt"
        ) VALUES (
            '${tarifa.tipoEntrega}',
            '${tarifa.tipoVehiculo}',
            '${tarifa.nombre}',
            '${tarifa.descripcion}',
            ${tarifa.tarifaBase},
            ${tarifa.costoPorKm},
            ${tarifa.costoPorKg},
            ${tarifa.costoMinimo},
            ${tarifa.kmIncluidos !== null ? tarifa.kmIncluidos : 'NULL'},
            ${tarifa.kgIncluidos !== null ? tarifa.kgIncluidos : 'NULL'},
            ${tarifa.tarifaUrgente !== null ? tarifa.tarifaUrgente : 'NULL'},
            ${tarifa.factorZona !== null ? tarifa.factorZona : 'NULL'},
            ${tarifa.activa},
            NOW(),
            NOW()
        )`;

        const insertResult = await executeSQL(insertSQL);

        if (insertResult.success) {
            console.log(`✅ Tarifa creada: ${tarifa.nombre}`);
        } else {
            console.log(`❌ Error creando ${tarifa.nombre}: ${insertResult.error}`);
        }
    }

    console.log('\n✨ Seed de Billing Service completado');
    console.log('\n📊 Verifica con:');
    console.log('kubectl exec -n logiflow postgres-billing-0 -- psql -U postgres -d billing_db -c "SELECT * FROM tarifas;"');
}

seedTarifas().catch(console.error);
