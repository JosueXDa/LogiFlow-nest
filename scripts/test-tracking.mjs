/**
 * Script de prueba para Tracking Service
 * Simula actualizaciones GPS de un repartidor
 */

const API_URL = 'http://localhost:3009';
const TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Obtener del login

// IDs de ejemplo (reemplazar con IDs reales)
const REPARTIDOR_ID = '123e4567-e89b-12d3-a456-426614174000';
const PEDIDO_ID = '123e4567-e89b-12d3-a456-426614174001';

// Coordenadas de ejemplo (Quito, Ecuador)
const ORIGEN = { lat: -0.1807, lng: -78.4678 }; // Centro de Quito
const DESTINO = { lat: -0.2299, lng: -78.5249 }; // Norte de Quito

/**
 * Simular ruta con puntos GPS
 */
function generarRuta(origen, destino, numPuntos = 10) {
    const ruta = [];
    for (let i = 0; i <= numPuntos; i++) {
        const t = i / numPuntos;
        ruta.push({
            latitud: origen.lat + (destino.lat - origen.lat) * t,
            longitud: origen.lng + (destino.lng - origen.lng) * t,
            velocidadKmh: 30 + Math.random() * 20, // 30-50 km/h
            precision: 5 + Math.random() * 5, // 5-10 metros
        });
    }
    return ruta;
}

/**
 * Iniciar ruta
 */
async function iniciarRuta() {
    console.log('🚀 Iniciando ruta...');

    const response = await fetch(`${API_URL}/tracking/ruta/iniciar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
            pedidoId: PEDIDO_ID,
            repartidorId: REPARTIDOR_ID,
            origenLat: ORIGEN.lat,
            origenLng: ORIGEN.lng,
            origenDireccion: 'Centro de Quito',
            destinoLat: DESTINO.lat,
            destinoLng: DESTINO.lng,
            destinoDireccion: 'Norte de Quito',
        }),
    });

    const ruta = await response.json();
    console.log('✅ Ruta iniciada:', ruta);
    return ruta;
}

/**
 * Enviar actualización GPS
 */
async function enviarUbicacion(ubicacion) {
    const response = await fetch(`${API_URL}/tracking/track`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
            repartidorId: REPARTIDOR_ID,
            pedidoId: PEDIDO_ID,
            ...ubicacion,
        }),
    });

    return await response.json();
}

/**
 * Consultar última ubicación
 */
async function consultarUltimaUbicacion() {
    const response = await fetch(
        `${API_URL}/tracking/repartidor/${REPARTIDOR_ID}/ubicacion`,
        {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
            },
        }
    );

    return await response.json();
}

/**
 * Finalizar ruta
 */
async function finalizarRuta(rutaId) {
    console.log('🏁 Finalizando ruta...');

    const response = await fetch(
        `${API_URL}/tracking/ruta/${rutaId}/finalizar`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
            },
        }
    );

    const ruta = await response.json();
    console.log('✅ Ruta finalizada:', ruta);
    return ruta;
}

/**
 * Simular tracking completo
 */
async function simularTracking() {
    try {
        // 1. Iniciar ruta
        const ruta = await iniciarRuta();

        // 2. Generar puntos GPS
        const puntos = generarRuta(ORIGEN, DESTINO, 10);

        // 3. Enviar ubicaciones cada 2 segundos
        console.log('📍 Enviando ubicaciones GPS...');
        for (let i = 0; i < puntos.length; i++) {
            const ubicacion = await enviarUbicacion(puntos[i]);
            console.log(`  ${i + 1}/${puntos.length} - Lat: ${puntos[i].latitud.toFixed(4)}, Lng: ${puntos[i].longitud.toFixed(4)}`);

            // Esperar 2 segundos
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // 4. Consultar última ubicación
        const ultimaUbicacion = await consultarUltimaUbicacion();
        console.log('📍 Última ubicación:', ultimaUbicacion);

        // 5. Finalizar ruta
        await finalizarRuta(ruta.id);

        console.log('✅ Simulación completada');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Ejecutar simulación
console.log('=== Simulación de Tracking GPS ===');
console.log('Asegúrate de:');
console.log('1. Tener el API Gateway corriendo en puerto 3009');
console.log('2. Tener el Tracking Service corriendo');
console.log('3. Actualizar el TOKEN con un JWT válido');
console.log('4. Actualizar los IDs de repartidor y pedido');
console.log('');

// Descomentar para ejecutar
// simularTracking();
