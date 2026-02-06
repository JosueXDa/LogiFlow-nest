import http from 'http';

function httpRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path,
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function seedFacturas() {
    console.log('💰 Generando facturas de prueba...\n');

    const zonas = [
        { id: 'e01acddd-7139-4132-b3fe-ca3cd3cbf144', nombre: 'Valle de los Chillos' },
        { id: '29f1ae65-55e0-4d0e-994a-60e47d0c55f4', nombre: 'Norte de Quito' },
    ];

    const estados = ['BORRADOR', 'EMITIDA', 'PAGADA'];
    const tiposEntrega = ['ESTANDAR', 'EXPRESS', 'PROGRAMADA'];
    const tiposVehiculo = ['VEHICULO_LIVIANO', 'CAMIONETA', 'CAMION'];

    let created = 0;
    let errors = 0;

    // Generar facturas para los últimos 3 días
    for (let daysAgo = 2; daysAgo >= 0; daysAgo--) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - daysAgo);
        
        console.log(`📅 Fecha: ${fecha.toISOString().split('T')[0]}`);

        // 5-8 facturas por día
        const cantidadFacturas = Math.floor(Math.random() * 4) + 5;

        for (let i = 0; i < cantidadFacturas; i++) {
            const zona = zonas[Math.floor(Math.random() * zonas.length)];
            const estado = estados[Math.floor(Math.random() * estados.length)];
            
            const dto = {
                pedidoId: `PED-${fecha.toISOString().split('T')[0]}-${String(i + 1).padStart(3, '0')}`,
                clienteId: `CLI-${Math.floor(Math.random() * 100) + 1}`,
                clienteNombre: `Cliente Test ${Math.floor(Math.random() * 100) + 1}`,
                clienteRuc: null,
                clienteDireccion: `Dirección Test ${i + 1}`,
                tipoEntrega: tiposEntrega[Math.floor(Math.random() * tiposEntrega.length)],
                tipoVehiculo: tiposVehiculo[Math.floor(Math.random() * tiposVehiculo.length)],
                distanciaKm: Math.floor(Math.random() * 20) + 2,
                pesoKg: Math.floor(Math.random() * 50) + 1,
                esUrgente: Math.random() > 0.7,
                zonaId: zona.id,
                zonaNombre: zona.nombre,
            };

            try {
                const factura = await httpRequest('POST', '/facturas/borrador', dto);
                
                if (factura.id) {
                    // Si debe estar emitida o pagada, cambiar estado
                    if (estado === 'EMITIDA' || estado === 'PAGADA') {
                        await httpRequest('PATCH', `/facturas/${factura.id}/emitir`);
                    }
                    
                    if (estado === 'PAGADA') {
                        await httpRequest('PATCH', `/facturas/${factura.id}/pagar`, {
                            metodoPago: 'EFECTIVO',
                            referencia: `PAG-${Date.now()}`,
                        });
                    }
                    
                    created++;
                    process.stdout.write('.');
                } else {
                    errors++;
                    process.stdout.write('x');
                }
            } catch (error) {
                errors++;
                process.stdout.write('x');
            }
        }
        
        console.log(` ${cantidadFacturas} intentadas`);
    }

    console.log(`\n✅ Facturas creadas: ${created}`);
    if (errors > 0) {
        console.log(`⚠️  Errores: ${errors}`);
    }

    // Verificar totales
    try {
        const facturas = await httpRequest('GET', '/facturas');
        console.log(`\n📊 Total en sistema: ${facturas.length || 0} facturas`);
        
        if (Array.isArray(facturas) && facturas.length > 0) {
            const porEstado = {};
            facturas.forEach(f => {
                porEstado[f.estado] = (porEstado[f.estado] || 0) + 1;
            });
            
            console.log('\nPor estado:');
            Object.entries(porEstado).forEach(([estado, count]) => {
                console.log(`  ${estado}: ${count}`);
            });
        }
    } catch (error) {
        console.log('⚠️  No se pudo verificar el total');
    }

    console.log('\n🎯 Ahora puedes probar la query kpiDiario en GraphQL Playground');
}

seedFacturas().catch(console.error);
