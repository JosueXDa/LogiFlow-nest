/**
 * Test simple - enviar SOLO los campos requeridos
 */

const API_GATEWAY_URL = 'http://localhost:3009';

async function testMinimalZona() {
    console.log('🧪 Probando creación de zona con campos mínimos\n');

    // 1. Login
    console.log('1. Login...');
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
    const cookies = `better_auth.session_token=${authData.token}`;
    console.log(`✅ Login exitoso - Role: ${authData.user.role}`);

    // 2. Crear zona CON SOLO nombre (mínimo requerido)
    console.log('\n2. Creando zona con SOLO nombre...');
    const zonaMinima = {
        nombre: 'Zona Mínima Test'
    };

    console.log(`   Body: ${JSON.stringify(zonaMinima)}`);

    const res1 = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
            'Origin': 'http://localhost:3009'
        },
        body: JSON.stringify(zonaMinima)
    });

    console.log(`   Status: ${res1.status}`);

    if (res1.ok) {
        const data = await res1.json();
        console.log(`   ✅ Zona creada!`);
        console.log(`   Respuesta: ${JSON.stringify(data, null, 2)}`);
    } else {
        const error = await res1.text();
        console.log(`   ❌ Error: ${error}`);
    }

    // 3. Crear zona con nombre Y descripcion
    console.log('\n3. Creando zona con nombre + descripcion...');
    const zonaConDesc = {
        nombre: 'Zona Con Descripción',
        descripcion: 'Esta es una descripción'
    };

    console.log(`   Body: ${JSON.stringify(zonaConDesc)}`);

    const res2 = await fetch(`${API_GATEWAY_URL}/flota/zonas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': cookies,
            'Origin': 'http://localhost:3009'
        },
        body: JSON.stringify(zonaConDesc)
    });

    console.log(`   Status: ${res2.status}`);

    if (res2.ok) {
        const data = await res2.json();
        console.log(`   ✅ Zona creada!`);
        console.log(`   Respuesta: ${JSON.stringify(data, null, 2)}`);
    } else {
        const error = await res2.text();
        console.log(`   ❌ Error: ${error}`);
    }
}

testMinimalZona().catch(console.error);
