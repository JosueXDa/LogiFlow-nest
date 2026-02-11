/**
 * Script unificado para poblar todas las bases de datos de LogiFlow en Kubernetes
 * Ejecutar con: node scripts/seed-all-k8s.mjs
 * Requisito: Port-forward activo en localhost:3009
 */

const API_GATEWAY_URL = 'http://localhost:3009';

// ============================================
// DATOS DE SEED
// ============================================

const ADMIN_CREDENTIALS = {
    email: 'admin@logiflow.com',
    password: 'Admin123!',
    name: 'Admin Sistema',
    role: 'ADMIN'
};

const ZONAS = [
    { nombre: 'Quito Norte', descripcion: 'Centro, La Carolina, Iñaquito, El Batán' },
    { nombre: 'Quito Sur', descripcion: 'Quitumbe, Chillogallo, La Magdalena' },
    { nombre: 'Valle de los Chillos', descripcion: 'Sangolquí, San Rafael, Conocoto' }
];

const VEHICULOS = [
    { placa: 'ABC-123', marca: 'Yamaha', modelo: 'FZ-25', tipo: 'MOTORIZADO', año: 2023, color: 'Negro', capacidadKg: 20.0, capacidadM3: 0.5, cilindradaCc: 250, tieneTopCase: true, estado: 'OPERATIVO' },
    { placa: 'XYZ-987', marca: 'Honda', modelo: 'XR-150', tipo: 'MOTORIZADO', año: 2022, color: 'Rojo', capacidadKg: 15.0, capacidadM3: 0.4, cilindradaCc: 150, tieneTopCase: true, estado: 'OPERATIVO' },
    { placa: 'LIV-001', marca: 'Chevrolet', modelo: 'Spark', tipo: 'VEHICULO_LIVIANO', año: 2020, color: 'Blanco', capacidadKg: 200.0, capacidadM3: 2.0, numeroPuertas: 5, esPickup: false, estado: 'OPERATIVO' }
];

const REPARTIDORES = [
    { nombre: 'Juan', apellido: 'Perez', cedula: '1723456789', telefono: '+593991234567', email: 'juan.perez@logiflow.com', licencia: 'LIC-001', tipoLicencia: 'A', estado: 'DISPONIBLE' },
    { nombre: 'Maria', apellido: 'Gomez', cedula: '1723456790', telefono: '+593987654321', email: 'maria.gomez@logiflow.com', licencia: 'LIC-002', tipoLicencia: 'B', estado: 'DISPONIBLE' },
    { nombre: 'Carlos', apellido: 'Ruiz', cedula: '1723456791', telefono: '+593998877665', email: 'carlos.ruiz@logiflow.com', licencia: 'LIC-003', tipoLicencia: 'A', estado: 'DISPONIBLE' }
];

const PRODUCTOS = [
    { sku: 'PROD-001', nombre: 'Laptop Pro 15', descripcion: 'Laptop de alta gama para desarrollo', precio: 1500.00, pesoKg: 2.5, stockTotal: 50 },
    { sku: 'PROD-002', nombre: 'Monitor 4K 27"', descripcion: 'Monitor Ultra HD con panel IPS', precio: 400.00, pesoKg: 5.0, stockTotal: 30 },
    { sku: 'PROD-003', nombre: 'Teclado Mecánico RGB', descripcion: 'Teclado con switches Cherry MX Blue', precio: 120.00, pesoKg: 1.2, stockTotal: 100 },
    { sku: 'PROD-004', nombre: 'Mouse Inalámbrico', descripcion: 'Mouse con sensor óptico de alta precisión', precio: 60.00, pesoKg: 0.3, stockTotal: 150 },
    { sku: 'PROD-005', nombre: 'Auriculares Noise Cancelling', descripcion: 'Auriculares con cancelación activa de ruido', precio: 250.00, pesoKg: 0.5, stockTotal: 40 }
];

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function makeRequest(method, path, body = null, cookies = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3009'
    };

    if (cookies) {
        headers['Cookie'] = cookies;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_GATEWAY_URL}${path}`, options);
    return response;
}

async function authenticate() {
    console.log('\n🔐 Autenticando...');

    // Intentar registrar admin (puede fallar si ya existe)
    try {
        const registerRes = await makeRequest('POST', '/api/auth/sign-up/email', ADMIN_CREDENTIALS);

        if (registerRes.ok) {
            console.log('✅ Usuario admin creado');
        } else if (registerRes.status === 409 || registerRes.status === 400) {
            console.log('⚠️  Usuario admin ya existe');
        } else {
            const errorText = await registerRes.text();
            console.log(`⚠️  Error al registrar (${registerRes.status}): ${errorText.substring(0, 100)}`);
        }
    } catch (e) {
        console.log(`⚠️  Error en registro: ${e.message}`);
    }

    // Iniciar sesión
    console.log('   Iniciando sesión...');
    const loginRes = await makeRequest('POST', '/api/auth/sign-in/email', {
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password
    });

    if (!loginRes.ok) {
        const errorText = await loginRes.text();
        throw new Error(`Error al iniciar sesión: ${loginRes.status} - ${errorText}`);
    }

    const authData = await loginRes.json();
    let cookies = loginRes.headers.getSetCookie?.()?.join('; ') || loginRes.headers.get('set-cookie');

    if (!cookies || !cookies.includes('better_auth.session_token')) {
        cookies = `better_auth.session_token=${authData.token}`;
    }

    console.log('✅ Autenticación exitosa');
    console.log(`   Token: ${authData.token?.substring(0, 20)}...`);
    return cookies;
}

async function seedZonas(cookies) {
    console.log('\n🗺️  Creando Zonas...');
    const zonasCreadas = [];

    for (const zona of ZONAS) {
        try {
            const res = await makeRequest('POST', '/flota/zonas', zona, cookies);

            if (res.ok) {
                const data = await res.json();
                zonasCreadas.push(data);
                console.log(`  ✅ ${zona.nombre} (ID: ${data.id})`);
            } else if (res.status === 409) {
                console.log(`  ⚠️  ${zona.nombre} (ya existe)`);
            } else {
                const errorText = await res.text();
                console.log(`  ❌ ${zona.nombre}: ${res.status} - ${errorText.substring(0, 150)}`);
            }
        } catch (e) {
            console.log(`  ❌ ${zona.nombre}: ${e.message}`);
        }
    }

    // Obtener zonas existentes si no se crearon
    if (zonasCreadas.length === 0) {
        console.log('   Obteniendo zonas existentes...');
        try {
            const res = await makeRequest('GET', '/flota/zonas', null, cookies);
            if (res.ok) {
                const todasZonas = await res.json();
                if (Array.isArray(todasZonas) && todasZonas.length > 0) {
                    zonasCreadas.push(...todasZonas);
                    console.log(`   ✅ Encontradas ${todasZonas.length} zonas existentes`);
                }
            }
        } catch (e) {
            console.log(`   ❌ Error al obtener zonas: ${e.message}`);
        }
    }

    return zonasCreadas;
}

async function seedVehiculos(cookies) {
    console.log('\n🚛 Creando Vehículos...');
    const vehiculosCreados = [];

    for (const vehiculo of VEHICULOS) {
        try {
            const res = await makeRequest('POST', '/flota/vehiculos', vehiculo, cookies);

            if (res.ok) {
                const data = await res.json();
                vehiculosCreados.push(data);
                console.log(`  ✅ ${vehiculo.placa}`);
            } else if (res.status === 409) {
                console.log(`  ⚠️  ${vehiculo.placa} (ya existe)`);
            } else {
                console.log(`  ❌ ${vehiculo.placa}: ${res.status}`);
            }
        } catch (e) {
            console.log(`  ❌ ${vehiculo.placa}: ${e.message}`);
        }
    }

    return vehiculosCreados;
}

async function seedRepartidores(cookies, zonas, vehiculos) {
    console.log('\n🧑‍✈️ Creando Repartidores...');

    for (let i = 0; i < REPARTIDORES.length; i++) {
        const repartidor = { ...REPARTIDORES[i] };

        // Asignar zona
        if (zonas.length > 0) {
            repartidor.zonaId = zonas[i % zonas.length].id;
        }

        // Asignar vehículo
        if (vehiculos.length > i) {
            repartidor.vehiculoId = vehiculos[i].id;
        }

        try {
            const res = await makeRequest('POST', '/flota/repartidores', repartidor, cookies);

            if (res.ok) {
                console.log(`  ✅ ${repartidor.nombre} ${repartidor.apellido}`);
            } else if (res.status === 409) {
                console.log(`  ⚠️  ${repartidor.nombre} (ya existe)`);
            } else {
                console.log(`  ❌ ${repartidor.nombre}: ${res.status}`);
            }
        } catch (e) {
            console.log(`  ❌ ${repartidor.nombre}: ${e.message}`);
        }
    }
}

async function seedProductos(cookies) {
    console.log('\n📦 Creando Productos...');

    for (const producto of PRODUCTOS) {
        try {
            const res = await makeRequest('POST', '/inventory/products', producto, cookies);

            if (res.ok) {
                console.log(`  ✅ ${producto.nombre}`);
            } else if (res.status === 409) {
                console.log(`  ⚠️  ${producto.nombre} (ya existe)`);
            } else {
                console.log(`  ❌ ${producto.nombre}: ${res.status}`);
            }
        } catch (e) {
            console.log(`  ❌ ${producto.nombre}: ${e.message}`);
        }
    }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
    console.log('🚀 Iniciando seed de LogiFlow en Kubernetes');
    console.log(`📍 API Gateway: ${API_GATEWAY_URL}`);
    console.log('⚠️  Asegúrate de que el port-forward esté activo: kubectl port-forward -n logiflow svc/api-gateway 3009:3009');

    try {
        // 1. Autenticar
        const cookies = await authenticate();

        // 2. Seed Fleet Service
        const zonas = await seedZonas(cookies);
        const vehiculos = await seedVehiculos(cookies);
        await seedRepartidores(cookies, zonas, vehiculos);

        // 3. Seed Inventory Service
        await seedProductos(cookies);

        console.log('\n✨ Seed completado exitosamente!');
        console.log('\n📊 Verifica los datos con:');
        console.log('  kubectl exec -n logiflow postgres-fleet-0 -- psql -U postgres -d fleet_db -c "SELECT COUNT(*) FROM zonas;"');
        console.log('  kubectl exec -n logiflow postgres-inventory-0 -- psql -U postgres -d inventory_db -c "SELECT COUNT(*) FROM productos;"');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

main();
