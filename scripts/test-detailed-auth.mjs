/**
 * Script para probar si el problema es con el guard o con el servicio
 */

const API_GATEWAY_URL = 'http://localhost:3009';

async function testWithDetailedLogging() {
    console.log('🔍 Prueba detallada de autenticación y creación de zona\n');

    // 1. Login
    console.log('1️⃣ Login...');
    const loginRes = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3009'
        },
        body: JSON.stringify({
            email: 'admin@logiflow.com',
            password: 'Admin123!'
        })
    });

    if (!loginRes.ok) {
        console.log(`❌ Login falló: ${loginRes.status}`);
        return;
    }

    const authData = await loginRes.json();
    console.log(`✅ Login exitoso`);
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email: ${authData.user.email}`);
    console.log(`   Role: ${authData.user.role}`);
    console.log(`   Token: ${authData.token.substring(0, 40)}...`);

    // Obtener cookies
    const setCookies = loginRes.headers.getSetCookie?.() || [];
    console.log(`\n   Set-Cookie headers recibidos: ${setCookies.length}`);
    setCookies.forEach((c, i) => {
        console.log(`     ${i + 1}. ${c.substring(0, 100)}...`);
    });

    const cookies = `better_auth.session_token=${authData.token}`;
    console.log(`\n   Cookie a usar: ${cookies.substring(0, 80)}...`);

    // 2. Probar GET /flota/zonas (debería funcionar)
    console.log('\n2️⃣ Probando GET /flota/zonas...');
    const getRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
            'Origin': 'http://localhost:3009'
        }
    });

    console.log(`   Status: ${getRes.status}`);
    if (getRes.ok) {
        const zonas = await getRes.json();
        console.log(`   ✅ GET funcionó - Zonas: ${JSON.stringify(zonas).substring(0, 100)}...`);
    } else {
        const error = await getRes.text();
        console.log(`   ❌ GET falló: ${error}`);
    }

    // 3. Probar POST /flota/zonas
    console.log('\n3️⃣ Probando POST /flota/zonas...');
    const zona = {
        nombre: 'Test Zona Debug',
        descripcion: 'Zona de prueba para debugging'
    };

    console.log(`   Body: ${JSON.stringify(zona)}`);

    const postRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
            'Origin': 'http://localhost:3009'
        },
        body: JSON.stringify(zona)
    });

    console.log(`   Status: ${postRes.status}`);

    if (postRes.ok) {
        const data = await postRes.json();
        console.log(`   ✅ POST funcionó!`);
        console.log(`   Respuesta: ${JSON.stringify(data, null, 2)}`);
    } else {
        const error = await postRes.text();
        console.log(`   ❌ POST falló`);
        console.log(`   Error: ${error}`);

        // Intentar parsear el error
        try {
            const errorJson = JSON.parse(error);
            console.log(`   Error detallado:`, errorJson);
        } catch (e) {
            // No es JSON
        }
    }

    // 4. Verificar si el problema es específico de POST
    console.log('\n4️⃣ Probando otros endpoints POST...');

    // Intentar crear un producto (inventory service)
    const producto = {
        sku: 'TEST-001',
        nombre: 'Producto Test',
        descripcion: 'Test',
        precio: 10.00,
        pesoKg: 1.0,
        stockTotal: 10
    };

    const prodRes = await fetch(`${API_GATEWAY_URL}/inventory/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
            'Origin': 'http://localhost:3009'
        },
        body: JSON.stringify(producto)
    });

    console.log(`   POST /inventory/products: ${prodRes.status}`);
    if (!prodRes.ok) {
        const error = await prodRes.text();
        console.log(`   Error: ${error.substring(0, 200)}`);
    } else {
        console.log(`   ✅ Inventory POST funcionó`);
    }
}

testWithDetailedLogging().catch(console.error);
