/**
 * Script simple para probar creación de una zona
 */

const API_GATEWAY_URL = 'http://localhost:3010';

async function testCreateZona() {
    console.log('🧪 Probando creación de zona\n');

    // 1. Login
    console.log('1. Login...');
    const loginRes = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3010'
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
    const cookies = `better_auth.session_token=${authData.token}`;
    console.log(`✅ Login exitoso`);
    console.log(`   Token: ${authData.token.substring(0, 30)}...`);

    // 2. Crear zona
    console.log('\n2. Creando zona...');
    const zona = {
        nombre: 'Zona Test Simple',
        cobertura: 'Test',
        activa: true
    };

    const createRes = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
            'Origin': 'http://localhost:3010'
        },
        body: JSON.stringify(zona)
    });

    console.log(`   Status: ${createRes.status}`);

    if (createRes.ok) {
        const data = await createRes.json();
        console.log(`   ✅ Zona creada exitosamente!`);
        console.log(`   Respuesta:`, JSON.stringify(data, null, 2));
    } else {
        const error = await createRes.text();
        console.log(`   ❌ Error al crear zona:`);
        console.log(`   ${error}`);
    }
}

testCreateZona().catch(console.error);
