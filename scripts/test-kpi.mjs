import http from 'http';

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

async function testKPI() {
    console.log('🔍 Testing KPI endpoint via API Gateway...\n');
    
    try {
        // Test 1: Ver todas las facturas via API Gateway
        console.log('1️⃣ Facturas via API Gateway:');
        const facturas = await httpGet('http://localhost:3009/billing/invoices');
        
        console.log('Tipo de respuesta:', typeof facturas);
        console.log('Respuesta completa:', JSON.stringify(facturas, null, 2).substring(0, 500));
        
        if (facturas && facturas.success && Array.isArray(facturas.data)) {
            console.log(`\n   Total: ${facturas.data.length} facturas\n`);
            
            // Mostrar fechas
            facturas.data.slice(0, 5).forEach(f => {
                const fecha = new Date(f.createdAt);
                console.log(`   - ${f.numeroFactura}: ${f.estado} - $${f.total}`);
                console.log(`     Creada: ${fecha.toISOString()}`);
                console.log(`     ZonaId: ${f.zonaId || 'null'}`);
            });
            
            // Contar por fecha
            const porFecha = {};
            facturas.data.forEach(f => {
                const fecha = new Date(f.createdAt).toISOString().split('T')[0];
                porFecha[fecha] = (porFecha[fecha] || 0) + 1;
            });
            
            console.log('\n   📊 Por fecha:');
            Object.entries(porFecha).forEach(([fecha, count]) => {
                console.log(`      ${fecha}: ${count} facturas`);
            });
        } else if (Array.isArray(facturas)) {
            console.log(`\n   Total: ${facturas.length} facturas`);
        } else {
            console.log('   ⚠️  Formato de respuesta inesperado');
        }
        
        // Test 2: Reporte diario para 2026-02-06 via API Gateway
        console.log('\n2️⃣ Reporte diario 2026-02-06 via API Gateway:');
        const fecha = '2026-02-06';
        const reporte = await httpGet(`http://localhost:3009/billing/daily-report?date=${fecha}`);
        
        console.log(JSON.stringify(reporte, null, 2));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testKPI();
