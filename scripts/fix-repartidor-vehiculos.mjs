const API_GATEWAY_URL = 'http://localhost:3009';

async function fixRepartidorVehiculos() {
    console.log('🔧 Asignando vehículos a repartidores...');

    // 1. Login como admin
    const authRes = await fetch(`${API_GATEWAY_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@logiflow.com', password: 'Admin123!' })
    });

    if (!authRes.ok) {
        console.error('❌ Error al iniciar sesión');
        return;
    }

    const authData = await authRes.json();
    console.log('Auth response:', authData);
    const token = authData.session?.token || authData.token;
    
    if (!token) {
        console.error('❌ No se pudo obtener el token');
        console.error('Respuesta completa:', JSON.stringify(authData, null, 2));
        return;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Obtener vehículos
    const vehiculosRes = await fetch(`${API_GATEWAY_URL}/flota/vehiculos`, { headers });
    
    if (!vehiculosRes.ok) {
        console.error(`❌ Error obteniendo vehículos: ${vehiculosRes.status}`);
        console.error(await vehiculosRes.text());
        return;
    }
    
    const vehiculosData = await vehiculosRes.json();
    const vehiculos = vehiculosData.data || vehiculosData;
    console.log(`📋 Encontrados ${vehiculos.length} vehículos`);

    // 3. Obtener repartidores
    const repartidoresRes = await fetch(`${API_GATEWAY_URL}/flota/repartidores`, { headers });
    
    if (!repartidoresRes.ok) {
        console.error(`❌ Error obteniendo repartidores: ${repartidoresRes.status}`);
        console.error(await repartidoresRes.text());
        return;
    }
    
    const repartidoresData = await repartidoresRes.json();
    const repartidores = repartidoresData.data || repartidoresData;
    console.log(`📋 Encontrados ${repartidores.length} repartidores`);

    // 4. Asignar vehículos a repartidores
    for (let i = 0; i < Math.min(repartidores.length, vehiculos.length); i++) {
        const repartidor = repartidores[i];
        const vehiculo = vehiculos[i];

        try {
            const updateRes = await fetch(`${API_GATEWAY_URL}/flota/repartidores/${repartidor.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ vehiculoId: vehiculo.id })
            });

            if (updateRes.ok) {
                console.log(`✅ ${repartidor.nombre} → ${vehiculo.placa} (${vehiculo.tipo})`);
            } else {
                const error = await updateRes.text();
                console.error(`❌ Error asignando vehículo a ${repartidor.nombre}: ${error}`);
            }
        } catch (e) {
            console.error(`❌ Error: ${e.message}`);
        }
    }

    console.log('🏁 Asignación completada');
}

fixRepartidorVehiculos();
