const API_GATEWAY_URL = 'http://localhost:3009';

async function checkVehiculos() {
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
        console.log('Auth response:', authData);
        const token = authData.session?.token || authData.token;

        if (!token) {
            console.error('❌ No se pudo obtener el token');
            console.error('authData:', JSON.stringify(authData, null, 2));
            return;
        }

        // Fetch vehicles
        const vehiculosRes = await fetch(`${API_GATEWAY_URL}/flota/vehiculos`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const vehiculosData = await vehiculosRes.json();
        const vehiculos = vehiculosData.data || vehiculosData;

        console.log('📋 Vehículos en la base de datos:\n');
        vehiculos.forEach(v => {
            console.log(`   Placa: ${v.placa}`);
            console.log(`   tipo: "${v.tipo}" (${typeof v.tipo})`);
            console.log(`   ID: ${v.id}\n`);
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkVehiculos();
