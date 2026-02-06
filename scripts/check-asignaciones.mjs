const API_GATEWAY_URL = 'http://localhost:3009';

async function checkAsignaciones() {
    try {
        // Login
        const loginRes = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@logiflow.com',
                password: 'Admin123!',
            }),
        });

        const authData = await loginRes.json();
        const token = authData.token;

        if (!token) {
            console.error('❌ No se pudo obtener el token');
            return;
        }

        // Fetch asignaciones
        const asignacionesRes = await fetch(`${API_GATEWAY_URL}/flota/asignaciones`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const response = await asignacionesRes.json();
        const asignaciones = response.data || response;

        console.log('📋 Asignaciones en el sistema:\n');
        
        if (Array.isArray(asignaciones)) {
            if (asignaciones.length === 0) {
                console.log('   No hay asignaciones todavía\n');
                return;
            }
            
            asignaciones.forEach(a => {
                console.log(`   🆔 ID Asignación: ${a.id}`);
                console.log(`   📦 Pedido ID: ${a.pedidoId}`);
                console.log(`   🚗 Repartidor ID: ${a.repartidorId}`);
                console.log(`   📊 Estado: ${a.estado}`);
                console.log(`   📅 Fecha: ${a.fechaAsignacion}`);
                console.log(`   ⏱️  Tiempo estimado: ${a.tiempoEstimadoMin} min\n`);
            });
        } else {
            console.log(JSON.stringify(asignaciones, null, 2));
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAsignaciones();
