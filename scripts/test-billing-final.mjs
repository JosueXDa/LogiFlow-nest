
async function test() {
    try {
        // 1. Login
        console.log('🔐 Iniciando sesión como admin2@test.com...');
        const loginRes = await fetch('http://localhost:3010/api/auth/sign-in/email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin2@test.com',
                password: 'Test123!'
            })
        });

        if (!loginRes.ok) {
            console.error('❌ Login fallido:', await loginRes.text());
            return;
        }

        const data = await loginRes.json();
        console.log('✅ Login exitoso. Token:', data.token?.substring(0, 20) + '...');

        // Obtener cookie de sesión
        const cookies = loginRes.headers.getSetCookie?.() || [];
        const cookieString = cookies.join('; ');

        // 2. Calcular Tarifa
        console.log('\n💰 Calculando tarifa...');
        const tariffRes = await fetch('http://localhost:3009/billing/calculate-tariff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': cookieString,
                'Authorization': `Bearer ${data.token}`
            },
            body: JSON.stringify({
                tipoEntrega: "URBANA",
                tipoVehiculo: "MOTORIZADO",
                distanciaKm: 5.2,
                pesoKg: 2.5,
                esUrgente: false,
                zonaId: "ZONA-001" // Opcional
            })
        });

        const tariffData = await tariffRes.json();
        console.log('📊 Respuesta Tarifa:', JSON.stringify(tariffData, null, 2));

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

test();
