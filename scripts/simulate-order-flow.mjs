const API_GATEWAY_URL = 'http://localhost:3009';

// Same auth logic
async function login() {
    console.log('🔑 Iniciando sesión...');
    const responseAuth = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
        },
        body: JSON.stringify({
            email: 'abel@test.com',
            password: 'abell123'
        })
    });

    if (!responseAuth.ok) throw new Error('Login failed');

    let rawCookies = responseAuth.headers.getSetCookie
        ? responseAuth.headers.getSetCookie().join('; ')
        : responseAuth.headers.get('set-cookie');

    if (!rawCookies) {
        const body = await responseAuth.json();
        rawCookies = `better-auth.session_token=${body.token}`;
    }
    return rawCookies;
}

async function simulate() {
    try {
        const cookies = await login();
        const headers = {
            'Content-Type': 'application/json',
            'Cookie': cookies,
            'Origin': 'http://localhost:3000'
        };

        // 1. CREATE PEDIDO
        console.log('\n📝 Creando pedido...');
        const createPayload = {
            clienteId: '550e8400-e29b-41d4-a716-446655440000', // UUID Dummy
            tipoVehiculo: 'MOTORIZADO',
            items: [
                { productoId: 'PROD-001', cantidad: 1 },
                { productoId: 'PROD-002', cantidad: 2 }
            ],
            origen: { direccion: 'Calle 1', lat: -0.182, lng: -78.482 },
            destino: { direccion: 'Calle 2', lat: -0.185, lng: -78.485 }
        };

        const resCreate = await fetch(`${API_GATEWAY_URL}/pedidos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(createPayload)
        });

        if (!resCreate.ok) throw new Error(`Create failed: ${await resCreate.text()}`);
        const pedido = await resCreate.json();
        const pedidoId = pedido.id;
        console.log(`✅ Pedido creado: ${pedidoId} (Estado: ${pedido.estado})`);

        // 2. CONFIRM PEDIDO
        console.log('\n💰 Confirmando pedido...');
        const resConfirm = await fetch(`${API_GATEWAY_URL}/pedidos/${pedidoId}/confirmar`, {
            method: 'POST',
            headers
        });

        if (!resConfirm.ok) throw new Error(`Confirm failed: ${await resConfirm.text()}`);
        const pedidoConfirmado = await resConfirm.json();
        console.log(`✅ Pedido confirmado: ${pedidoId} (Estado: ${pedidoConfirmado.estado})`);

        // 3. POLL STATUS (Wait for Fleet to assign)
        console.log('\n⏳ Esperando asignación de conductor (Event Driven)...');
        let attempts = 0;
        let assigned = false;

        while (attempts < 10 && !assigned) {
            attempts++;
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s

            const resGet = await fetch(`${API_GATEWAY_URL}/pedidos/${pedidoId}`, { headers });
            const p = await resGet.json();

            process.stdout.write(`Attempt ${attempts}: ${p.estado} \r`);

            if (p.estado === 'ASIGNADO') {
                assigned = true;
                console.log(`\n✅ ¡Pedido ASIGNADO! El flujo de eventos funciona.`);
                console.log(`   Conductor ID: ${p.conductorId || 'N/A'}`);
            }
            if (p.estado === 'ENTREGADO') {
                assigned = true;
                console.log(`\n✅ ¡Pedido ENTREGADO!`);
            }
        }

        if (!assigned) {
            console.log('\n⚠️ Tiempo de espera agotado. Verifica si el Fleet Service y Repartidores están activos.');
        } else {
            console.log('\n🎉 Flujo Simulado Exitosamente (Hasta Asignación).');
            console.log('NOTA: Para completar la entrega, se requiere el ID de asignación del Fleet Service para llamar a /finalizar.');
        }

    } catch (error) {
        console.error('\n❌ Simulation Failed:', error.message);
    }
}

simulate();
