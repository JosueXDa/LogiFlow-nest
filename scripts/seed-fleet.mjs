const API_GATEWAY_URL = 'http://localhost:3009';

const vehicles = [
    {
        placa: 'ABC-123',
        marca: 'Yamaha',
        modelo: 'FZ-25',
        tipo: 'MOTORIZADO',
        año: 2023,
        color: 'Negro',
        capacidadKg: 20.0,
        capacidadM3: 0.5,
        cilindradaCc: 250,
        tieneTopCase: true,
        estado: 'OPERATIVO'
    },
    {
        placa: 'XYZ-987',
        marca: 'Honda',
        modelo: 'XR-150',
        tipo: 'MOTORIZADO',
        año: 2022,
        color: 'Rojo',
        capacidadKg: 15.0,
        capacidadM3: 0.4,
        cilindradaCc: 150,
        tieneTopCase: true,
        estado: 'OPERATIVO'
    },
    {
        placa: 'LIV-001',
        marca: 'Chevrolet',
        modelo: 'Spark',
        tipo: 'VEHICULO_LIVIANO',
        año: 2020,
        color: 'Blanco',
        capacidadKg: 200.0,
        capacidadM3: 2.0,
        numeroPuertas: 5,
        esPickup: false,
        estado: 'OPERATIVO'
    }
];

const drivers = [
    {
        nombre: 'Juan',
        apellido: 'Perez',
        cedula: '1723456789',
        telefono: '+593991234567',
        email: 'juan.perez@logiflow.com',
        licencia: 'LIC-001',
        tipoLicencia: 'A',
        estado: 'DISPONIBLE',
        zonaId: '550e8400-e29b-41d4-a716-446655440001' // UUID valido
    },
    {
        nombre: 'Maria',
        apellido: 'Gomez',
        cedula: '1723456790',
        telefono: '+593987654321',
        email: 'maria.gomez@logiflow.com',
        licencia: 'LIC-002',
        tipoLicencia: 'B',
        estado: 'DISPONIBLE',
        zonaId: '550e8400-e29b-41d4-a716-446655440002'
    },
    {
        nombre: 'Carlos',
        apellido: 'Ruiz',
        cedula: '1723456791',
        telefono: '+593998877665',
        email: 'carlos.ruiz@logiflow.com',
        licencia: 'LIC-003',
        tipoLicencia: 'A',
        estado: 'DISPONIBLE',
        zonaId: '550e8400-e29b-41d4-a716-446655440003'
    }
];

async function seedFleet() {
    console.log(`🚀 Iniciando seed de FLOTA a ${API_GATEWAY_URL}...`);

    // 1. LOGIN
    const responseAuth = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
            email: 'abel@test.com', // Asumiendo que este usuario existe tras correr seed-inventory o auth setup
            password: 'abell123'
        })
    });

    if (!responseAuth.ok) {
        console.error('❌ Error al iniciar sesión:', await responseAuth.text());
        process.exit(1);
    }

    let rawCookies = responseAuth.headers.getSetCookie
        ? responseAuth.headers.getSetCookie().join('; ')
        : responseAuth.headers.get('set-cookie');

    if (!rawCookies) {
        const body = await responseAuth.json();
        rawCookies = `better-auth.session_token=${body.token}`;
    }

    console.log('✅ Sesión iniciada.');

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': rawCookies,
        'Origin': 'http://localhost:3000'
    };

    // 2. CREAR VEHÍCULOS
    console.log('\n🚛 Creando Vehículos...');
    for (const v of vehicles) {
        try {
            const res = await fetch(`${API_GATEWAY_URL}/flota/vehiculos`, {
                method: 'POST',
                headers,
                body: JSON.stringify(v)
            });

            if (res.ok) {
                console.log(`✅ Vehículo creado: ${v.placa}`);
            } else {
                const err = await res.text();
                // Si ya existe (Conflict), lo ignoramos o lo reportamos suavemente
                if (res.status === 409) {
                    console.log(`⚠️  Vehículo ${v.placa} ya existe.`);
                } else {
                    console.error(`❌ Falló Vehículo ${v.placa}: ${err}`);
                }
            }
        } catch (e) {
            console.error(`❌ Error red Vehículo ${v.placa}:`, e.message);
        }
    }

    // 3. CREAR REPARTIDORES
    console.log('\n🧑‍✈️ Creando Repartidores...');
    for (const d of drivers) {
        try {
            const res = await fetch(`${API_GATEWAY_URL}/flota/repartidores`, {
                method: 'POST',
                headers,
                body: JSON.stringify(d)
            });

            if (res.ok) {
                console.log(`✅ Repartidor creado: ${d.nombre}`);
            } else {
                const err = await res.text();
                if (res.status === 409) {
                    console.log(`⚠️  Repartidor ${d.nombre} ya existe.`);
                } else {
                    console.error(`❌ Falló Repartidor ${d.nombre}: ${err}`);
                }
            }
        } catch (e) {
            console.error(`❌ Error red Repartidor ${d.nombre}:`, e.message);
        }
    }

    console.log('\n🏁 Seed flota finalizado.');
}

seedFleet();
