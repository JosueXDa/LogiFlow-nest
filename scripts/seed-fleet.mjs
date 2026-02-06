const API_GATEWAY_URL = 'http://localhost:3009';

const zonas = [
    {
        nombre: 'Quito Norte',
        cobertura: 'Centro, La Carolina, Iñaquito, El Batán',
        activa: true
    },
    {
        nombre: 'Quito Sur',
        cobertura: 'Quitumbe, Chillogallo, La Magdalena',
        activa: true
    },
    {
        nombre: 'Valle de los Chillos',
        cobertura: 'Sangolquí, San Rafael, Conocoto',
        activa: true
    }
];

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

// Nota: zonaId se asignará dinámicamente después de crear las zonas
const drivers = [
    {
        nombre: 'Juan',
        apellido: 'Perez',
        cedula: '1723456789',
        telefono: '+593991234567',
        email: 'juan.perez@logiflow.com',
        licencia: 'LIC-001',
        tipoLicencia: 'A',
        estado: 'DISPONIBLE'
    },
    {
        nombre: 'Maria',
        apellido: 'Gomez',
        cedula: '1723456790',
        telefono: '+593987654321',
        email: 'maria.gomez@logiflow.com',
        licencia: 'LIC-002',
        tipoLicencia: 'B',
        estado: 'DISPONIBLE'
    },
    {
        nombre: 'Carlos',
        apellido: 'Ruiz',
        cedula: '1723456791',
        telefono: '+593998877665',
        email: 'carlos.ruiz@logiflow.com',
        licencia: 'LIC-003',
        tipoLicencia: 'A',
        estado: 'DISPONIBLE'
    }
];

async function seedFleet() {
    console.log(`🚀 Iniciando seed de FLOTA a ${API_GATEWAY_URL}...`);

    const credentials = {
        email: 'admin@logiflow.com',
        password: 'Admin123!',
        name: 'Admin Sistema',
        role: 'ADMIN'
    };

    // 1. INTENTAR REGISTRO (si el usuario no existe)
    console.log('📝 Verificando usuario admin...');
    const responseRegister = await fetch(`${API_GATEWAY_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify(credentials)
    });

    if (responseRegister.ok) {
        console.log('✅ Usuario admin creado.');
    } else if (responseRegister.status === 409 || responseRegister.status === 400) {
        const error = await responseRegister.json().catch(() => ({}));
        console.log('⚠️  Usuario admin ya existe.');
    } else {
        const errorText = await responseRegister.text();
        console.warn('⚠️  Error al registrar:', errorText);
    }

    // 2. LOGIN
    const responseAuth = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
            email: credentials.email,
            password: credentials.password
        })
    });

    if (!responseAuth.ok) {
        console.error('❌ Error al iniciar sesión:', await responseAuth.text());
        console.error('💡 Asegúrate de que el API Gateway esté corriendo en', API_GATEWAY_URL);
        process.exit(1);
    }

    const authData = await responseAuth.json();
    let rawCookies = responseAuth.headers.getSetCookie
        ? responseAuth.headers.getSetCookie().join('; ')
        : responseAuth.headers.get('set-cookie');

    // Si no hay cookies en los headers, usar el token del body
    if (!rawCookies || !rawCookies.includes('better_auth.session_token')) {
        rawCookies = `better_auth.session_token=${authData.token}`;
        console.log('🔑 Token extraído:', authData.token);
    }

    console.log('✅ Sesión iniciada.');

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': rawCookies,
        'Origin': 'http://localhost:3000'
    };

    // 2. CREAR ZONAS (necesarias antes de crear repartidores)
    console.log('\n🗺️  Creando Zonas...');
    const zonasCreadas = [];
    for (const z of zonas) {
        try {
            const res = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
                method: 'POST',
                headers,
                body: JSON.stringify(z)
            });

            if (res.ok) {
                const zonaCreada = await res.json();
                zonasCreadas.push(zonaCreada);
                console.log(`✅ Zona creada: ${z.nombre} (ID: ${zonaCreada.id})`);
            } else {
                // Si falla (409, 500, etc.), intentar obtener la zona existente
                const err = await res.text();
                if (res.status === 409 || res.status === 500) {
                    console.log(`⚠️  Zona ${z.nombre} probablemente ya existe, buscando...`);
                } else {
                    console.error(`❌ Falló Zona ${z.nombre}: ${err}`);
                }
            }
        } catch (e) {
            console.error(`❌ Error red Zona ${z.nombre}:`, e.message);
        }
    }

    // Obtener todas las zonas existentes si no se pudieron crear
    if (zonasCreadas.length === 0) {
        console.log('📋 Obteniendo zonas existentes...');
        try {
            const getRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
                method: 'GET',
                headers
            });
            console.log(`   Status: ${getRes.status}`);
            if (getRes.ok) {
                const todasZonas = await getRes.json();
                console.log(`   Respuesta:`, todasZonas);
                if (Array.isArray(todasZonas) && todasZonas.length > 0) {
                    zonasCreadas.push(...todasZonas);
                    console.log(`✅ Se encontraron ${todasZonas.length} zonas existentes.`);
                } else {
                    console.log(`⚠️  No hay zonas existentes en la base de datos.`);
                }
            } else {
                const errText = await getRes.text();
                console.error(`❌ Error al obtener zonas: ${errText}`);
            }
        } catch (e) {
            console.error('❌ Error al obtener zonas existentes:', e.message);
        }
    }

    if (zonasCreadas.length === 0) {
        console.error('❌ No se pudieron crear ni obtener zonas. Abortando seed de repartidores.');
        console.log('🏁 Seed flota finalizado (parcialmente).');
        return;
    }

    // 3. CREAR VEHÍCULOS
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

    // 4. CREAR REPARTIDORES
    console.log('\n🧑‍✈️ Creando Repartidores...');
    for (let i = 0; i < drivers.length; i++) {
        const d = drivers[i];
        // Asignar zona de forma circular (si hay 3 zonas y 3 repartidores, uno por zona)
        const zonaIndex = i % zonasCreadas.length;
        d.zonaId = zonasCreadas[zonaIndex].id;

        try {
            const res = await fetch(`${API_GATEWAY_URL}/flota/repartidores`, {
                method: 'POST',
                headers,
                body: JSON.stringify(d)
            });

            if (res.ok) {
                console.log(`✅ Repartidor creado: ${d.nombre} (Zona: ${zonasCreadas[zonaIndex].nombre})`);
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
