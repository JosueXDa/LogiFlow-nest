/**
 * Script de diagnóstico avanzado para autenticación
 */

const API_GATEWAY_URL = 'http://localhost:3009';

async function detailedAuthTest() {
    console.log('🔍 Diagnóstico detallado de autenticación\n');

    // 1. Login
    console.log('1️⃣ Realizando login...');
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

    console.log(`   Status: ${loginRes.status}`);

    if (!loginRes.ok) {
        console.log(`   ❌ Login falló: ${await loginRes.text()}`);
        return;
    }

    const authData = await loginRes.json();
    console.log(`   ✅ Login exitoso`);
    console.log(`   User ID: ${authData.user?.id}`);
    console.log(`   Token: ${authData.token?.substring(0, 20)}...`);

    // Obtener todas las cookies
    const setCookieHeaders = loginRes.headers.getSetCookie?.() || [];
    console.log(`\n   Set-Cookie headers (${setCookieHeaders.length}):`);
    setCookieHeaders.forEach((cookie, i) => {
        console.log(`     ${i + 1}. ${cookie.substring(0, 80)}...`);
    });

    // Construir cookie string
    let cookieString = '';
    if (setCookieHeaders.length > 0) {
        cookieString = setCookieHeaders.map(c => c.split(';')[0]).join('; ');
    } else {
        cookieString = `better_auth.session_token=${authData.token}`;
    }

    console.log(`\n   Cookie string a usar: ${cookieString.substring(0, 80)}...`);

    // 2. Probar endpoint sin autenticación
    console.log('\n2️⃣ Probando endpoint SIN autenticación (GET /flota/zonas)...');
    const noAuthRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3009'
        }
    });
    console.log(`   Status: ${noAuthRes.status} (esperado: 401)`);

    // 3. Probar endpoint CON autenticación
    console.log('\n3️⃣ Probando endpoint CON autenticación (GET /flota/zonas)...');
    const authRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieString,
            'Origin': 'http://localhost:3009'
        }
    });

    console.log(`   Status: ${authRes.status}`);

    if (authRes.ok) {
        const data = await authRes.json();
        console.log(`   ✅ Autenticación funcionó!`);
        console.log(`   Respuesta: ${JSON.stringify(data).substring(0, 100)}...`);
    } else {
        const error = await authRes.text();
        console.log(`   ❌ Autenticación falló`);
        console.log(`   Error: ${error}`);
    }

    // 4. Probar con Authorization header (alternativa)
    console.log('\n4️⃣ Probando con Authorization header...');
    const bearerRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authData.token}`,
            'Origin': 'http://localhost:3009'
        }
    });

    console.log(`   Status: ${bearerRes.status}`);
    if (bearerRes.ok) {
        console.log(`   ✅ Authorization header funcionó!`);
    } else {
        console.log(`   ❌ Authorization header no funcionó`);
    }

    // 5. Probar crear zona
    console.log('\n5️⃣ Probando crear zona con Cookie...');
    const createRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieString,
            'Origin': 'http://localhost:3009'
        },
        body: JSON.stringify({
            nombre: 'Zona Diagnóstico',
            cobertura: 'Test de diagnóstico',
            activa: true
        })
    });

    console.log(`   Status: ${createRes.status}`);

    if (createRes.ok) {
        const zona = await createRes.json();
        console.log(`   ✅ Zona creada: ${JSON.stringify(zona)}`);
    } else {
        const error = await createRes.text();
        console.log(`   ❌ Error: ${error}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('Diagnóstico completado');
}

detailedAuthTest().catch(console.error);
