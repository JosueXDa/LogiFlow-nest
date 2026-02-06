const API_GATEWAY_URL = 'http://localhost:3009';

const products = [
    {
        sku: 'PROD-001',
        nombre: 'Laptop Pro 15',
        descripcion: 'Laptop de alta gama para desarrollo',
        precio: 1500.00,
        pesoKg: 2.5,
        stockTotal: 50
    },
    {
        sku: 'PROD-002',
        nombre: 'Monitor 4K 27"',
        descripcion: 'Monitor Ultra HD con panel IPS',
        precio: 400.00,
        pesoKg: 5.0,
        stockTotal: 30
    },
    {
        sku: 'PROD-003',
        nombre: 'Teclado Mecánico RGB',
        descripcion: 'Teclado con switches Cherry MX Blue',
        precio: 120.00,
        pesoKg: 1.2,
        stockTotal: 100
    },
    {
        sku: 'PROD-004',
        nombre: 'Mouse Inalámbrico Ergonómico',
        descripcion: 'Mouse con sensor óptico de alta precisión',
        precio: 60.00,
        pesoKg: 0.3,
        stockTotal: 150
    },
    {
        sku: 'PROD-005',
        nombre: 'Auriculares Noise Cancelling',
        descripcion: 'Auriculares con cancelación activa de ruido',
        precio: 250.00,
        pesoKg: 0.5,
        stockTotal: 40
    },
    {
        sku: 'PROD-006',
        nombre: 'Disco Duro Externo 2TB',
        descripcion: 'Unidad de almacenamiento portátil USB 3.0',
        precio: 85.00,
        pesoKg: 0.4,
        stockTotal: 200
    },
    {
        sku: 'PROD-007',
        nombre: 'Silla Ergonómica de Oficina',
        descripcion: 'Silla con soporte lumbar ajustable',
        precio: 300.00,
        pesoKg: 15.0,
        stockTotal: 20
    },
    {
        sku: 'PROD-008',
        nombre: 'Escritorio Elevable Eléctrico',
        descripcion: 'Escritorio con altura programable',
        precio: 550.00,
        pesoKg: 25.0,
        stockTotal: 10
    },
    {
        sku: 'PROD-009',
        nombre: 'Cámara Web 1080p',
        descripcion: 'Cámara para videoconferencias con micrófono',
        precio: 75.00,
        pesoKg: 0.2,
        stockTotal: 80
    },
    {
        sku: 'PROD-010',
        nombre: 'Adaptador USB-C Multiport',
        descripcion: 'Hub con HDMI, USB-A y lector de tarjetas',
        precio: 45.00,
        pesoKg: 0.1,
        stockTotal: 120
    }
];

async function seed() {
    console.log(`🚀 Iniciando proceso de seed a ${API_GATEWAY_URL}...`);

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

    // 2. INICIAR SESIÓN
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
    });4

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

    console.log('✅ Sesión iniciada. Usando cookies:', rawCookies.substring(0, 30) + '...');

    // 3. CREAR PRODUCTOS
    for (const product of products) {
        try {
            const response = await fetch(`${API_GATEWAY_URL}/inventory/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Usamos la cookie exacta que nos dio el servidor
                    'Cookie': rawCookies,
                    // Mantenemos el Origin para pasar las validaciones del Guard/Auth
                    'Origin': 'http://localhost:3000'
                },
                body: JSON.stringify(product)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Product created: ${product.nombre}`);
            } else {
                const error = await response.text();
                // Parseamos el error para verlo limpio
                try {
                    const errorJson = JSON.parse(error);
                    console.error(`❌ Falló ${product.nombre}:`, errorJson.message || errorJson);
                } catch {
                    console.error(`❌ Falló ${product.nombre}: ${response.status} - ${error}`);
                }
            }
        } catch (err) {
            console.error(`❌ Error de red creando ${product.nombre}:`, err.message);
        }
    }

    console.log('🏁 Seed process finished!');
}

seed();
