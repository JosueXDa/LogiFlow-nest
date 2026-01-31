const API_GATEWAY_URL = 'http://localhost:3009';
const AUTH_COOKIE = "better-auth.session_token=25ym36GnrrgeHp3xDY1fAPoHcbmzrLSu";

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

    // 1. INICIAR SESIÓN
    const responseAuth = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Importante: Fingir un Origin válido para que el servidor acepte la petición
            'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
            email: 'abel@test.com',
            password: 'abell123'
        })
    });

    if (!responseAuth.ok) {
        console.error('❌ Error al iniciar sesión:', await responseAuth.text());
        process.exit(1);
    }

    // 2. OBTENER LA COOKIE REAL DEL HEADER (LA CLAVE DEL ÉXITO)
    // Node >= 18 usa getSetCookie() para obtener array, o get('set-cookie') para string
    // Better Auth puede enviar varias cookies, las unimos para asegurarnos.
    let rawCookies = responseAuth.headers.getSetCookie
        ? responseAuth.headers.getSetCookie().join('; ')
        : responseAuth.headers.get('set-cookie');

    if (!rawCookies) {
        console.error('❌ Error: El servidor no devolvió cookies en el header Set-Cookie.');
        // Fallback de emergencia por si tu versión de Better Auth devuelve el token plano en body
        // pero esto suele fallar si la cookie requiere firma.
        const body = await responseAuth.json();
        console.log('Intentando fallback con token del body...');
        rawCookies = `better-auth.session_token=${body.token}`;
    }

    console.log('✅ Sesión iniciada. Usando cookies:', rawCookies.substring(0, 20) + '...');

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
