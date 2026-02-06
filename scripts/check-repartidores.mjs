const API_GATEWAY_URL = 'http://localhost:3009';

async function checkRepartidores() {
    console.log('🔍 Verificando estado de repartidores...');

    // Login
    const authRes = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@logiflow.com', password: 'Admin123!' })
    });

    const authData = await authRes.json();
    const token = authData.token;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // Obtener repartidores
    const repartidoresRes = await fetch(`${API_GATEWAY_URL}/flota/repartidores`, { headers });
    const repartidoresData = await repartidoresRes.json();
    const repartidores = repartidoresData.data || repartidoresData;

    console.log('\n📋 Repartidores en el sistema:');
    repartidores.forEach(r => {
        console.log(`   ${r.nombre}: vehiculoId=${r.vehiculoId || 'NULL'}, estado=${r.estado}`);
    });
}

checkRepartidores();
