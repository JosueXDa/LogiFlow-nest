import http from 'http';

// Simple HTTP GET request
function httpGet(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

async function checkFacturas() {
    try {
        console.log('🔍 Verificando facturas en el sistema...\n');
        
        const facturas = await httpGet('http://localhost:3001/facturas');
        
        if (Array.isArray(facturas)) {
            console.log(`✅ Total de facturas: ${facturas.length}\n`);
            
            if (facturas.length > 0) {
                console.log('📄 Últimas 3 facturas:');
                facturas.slice(0, 3).forEach(f => {
                    console.log(`  - ${f.numeroFactura}: ${f.estado} - $${f.total} (${new Date(f.createdAt).toLocaleDateString()})`);
                });
                
                // Contar por fecha
                const facturasPorFecha = {};
                facturas.forEach(f => {
                    const fecha = new Date(f.createdAt).toISOString().split('T')[0];
                    facturasPorFecha[fecha] = (facturasPorFecha[fecha] || 0) + 1;
                });
                
                console.log('\n📊 Facturas por fecha:');
                Object.entries(facturasPorFecha).forEach(([fecha, count]) => {
                    console.log(`  - ${fecha}: ${count} facturas`);
                });
            } else {
                console.log('⚠️  No hay facturas en el sistema');
                console.log('\n💡 Las facturas se crean automáticamente cuando:');
                console.log('   1. Se crea un pedido (factura en estado BORRADOR)');
                console.log('   2. Se confirma un pedido (factura pasa a EMITIDA)');
                console.log('\n📝 Para generar facturas de prueba:');
                console.log('   node scripts/simulate-order-flow.mjs');
            }
        } else {
            console.log('❌ Respuesta inesperada:', facturas);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Asegúrate de que el Billing Service esté corriendo en el puerto 3001');
    }
}

checkFacturas();
