## 🔍 Debugging kpiDiario que devuelve ceros

### Problema

La query `kpiDiario` devuelve todos los valores en 0 a pesar de tener pedidos en el sistema.

### Causa Raíz

**Los KPIs se calculan desde la tabla `facturas`, NO desde `pedidos`.**

```typescript
// billing-service/src/modules/billing/services/billing.service.ts
async getReporteDiario(fecha: Date, zonaId?: string) {
    const query = this.facturaRepository
        .createQueryBuilder('factura')
        .where('factura.createdAt BETWEEN :inicio AND :fin', { inicio, fin });
    
    if (zonaId) {
        query.andWhere('factura.zonaId = :zonaId', { zonaId });
    }
    
    const facturas = await query.getMany();
    // ... cálculos basados en facturas
}
```

---

### Flujo de Creación de Facturas

```mermaid
graph LR
    A[POST /api/pedidos] --> B[Pedidos Service]
    B --> C[Emite evento pedido.creado]
    C --> D[RabbitMQ]
    D --> E[Billing Service Consumer]
    E --> F[Crea Factura BORRADOR]
    F --> G[Tabla facturas]
```

**Las facturas se crean automáticamente cuando:**

1. **Se crea un pedido** → Evento `pedido.creado` → Factura en estado `BORRADOR`
2. **Se confirma el pedido** → Evento `pedido.confirmado` → Factura pasa a `EMITIDA`
3. **Se paga** → Evento manual → Factura pasa a `PAGADA`

---

### Verificación del Problema

#### 1. Verificar si hay facturas en el sistema

```bash
# En PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:3001/facturas" -Method GET -UseBasicParsing
$facturas = $response.Content | ConvertFrom-Json
Write-Host "Total facturas: $($facturas.Count)"
```

**Si devuelve 0**: No hay facturas → No hay datos para KPIs

#### 2. Verificar RabbitMQ

Accede a la interfaz de RabbitMQ:
- **URL**: http://localhost:15672
- **Usuario**: `admin`
- **Password**: `sSV9aCH2BM9zrjuFYvPbXQcm3Rt9ZMuJ`

**Verifica**:
- ✅ Queues: `pedido.creado`, `pedido.confirmado`, `entrega.completada` existen
- ✅ Consumers: Billing Service está consumiendo mensajes
- ✅ Messages: No hay mensajes atascados (unacked)

#### 3. Verificar logs del Billing Service

```bash
# En la terminal del billing-service
# Deberías ver:
📨 Evento recibido: pedido.creado - PED-xxx
✅ Factura borrador creada: F-202602-000001
```

**Si no ves estos logs**: RabbitMQ no está enviando eventos al Billing Service

---

### Soluciones

#### Opción 1: Crear Pedidos que Disparen Eventos

Usa el REST endpoint para crear un pedido:

```bash
# Obtener token primero
$token = "TU_JWT_TOKEN"

# Crear pedido
$body = @{
    clienteId = "cliente-test-001"
    clienteNombre = "Test Cliente"
    clienteDireccion = "Av. Test 123"
    tipoEntrega = "ESTANDAR"
    tipoVehiculo = "VEHICULO_LIVIANO"
    distanciaKm = 5.5
    pesoKg = 10
    esUrgente = $false
    zonaId = "e01acddd-7139-4132-b3fe-ca3cd3cbf144"
    zonaNombre = "Valle de los Chillos"
    direccionDestino = @{
        lat = -0.185
        lng = -78.485
        direccion = "Av. Test 123"
    }
} | ConvertTo-Json

Invoke-WebRequest `
    -Uri "http://localhost:3009/api/pedidos" `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    } `
    -Body $body
```

**Esto debería**:
1. Crear el pedido en Pedidos Service
2. Emitir evento `pedido.creado` a RabbitMQ
3. Billing Service consumir el evento
4. Crear factura en estado BORRADOR

#### Opción 2: Verificar Conexión RabbitMQ del Billing Service

Revisa el archivo `.env` o configuración:

```typescript
// apps/billing-service/src/main.ts
app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
        urls: ['amqp://admin:sSV9aCH2BM9zrjuFYvPbXQcm3Rt9ZMuJ@localhost:5672'],
        queue: 'billing_service_queue',
        queueOptions: {
            durable: true,
        },
    },
});
```

**Reinicia Billing Service** después de verificar configuración.

#### Opción 3: Usar el Script Simulator (si está funcional)

```bash
node scripts/simulate-order-flow.mjs
```

---

### **Fix Aplicado al Resolver**

Ya actualicé el resolver de GraphQL para mapear correctamente la respuesta del Billing Service:

```typescript
// apps/api-gateway/src/graphql/resolvers/billing.resolver.ts
async getKpiDiario(fecha: string, zonaId?: string) {
    const res = await firstValueFrom(
        this.billingClient.send({ cmd: 'billing.reporte_diario' }, { fecha, zonaId })
    );

    if (res.success && res.data && res.data.resumen) {
        const { resumen } = res.data;
        
        return {
            totalPedidos: resumen.cantidadTotal || 0,
            costoPromedioEntrega: resumen.cantidadTotal > 0 
                ? resumen.totalFacturado / resumen.cantidadTotal 
                : 0,
            tasaCumplimiento: resumen.cantidadTotal > 0 
                ? (resumen.cantidadPagada / resumen.cantidadTotal) * 100 
                : 0,
            ingresosTotales: resumen.totalPagado || 0,
        };
    }
    
    return { totalPedidos: 0, costoPromedioEntrega: 0, tasaCumplimiento: 0, ingresosTotales: 0 };
}
```

**Mapeo correcto**:
- `totalPedidos` ← `resumen.cantidadTotal` (todas las facturas)
- `costoPromedioEntrega` ← `resumen.totalFacturado / cantidadTotal`
- `tasaCumplimiento` ← `(resumen.cantidadPagada / cantidadTotal) * 100`
- `ingresosTotales` ← `resumen.totalPagado` (solo facturas PAGADAS)

---

### **Resumen**

✅ **Resolver GraphQL**: Corregido
✅ **Documentación**: Actualizada con schema real
❌ **Datos**: No hay facturas en la base de datos

**Próximos pasos**:
1. Verifica RabbitMQ (http://localhost:15672)
2. Crea un pedido de prueba con el comando POST arriba
3. Verifica logs del Billing Service viendo que se crea la factura
4. Ejecuta nuevamente la query `kpiDiario`

**Si después de crear pedidos sigue devolviendo ceros**: El problema está en RabbitMQ (eventos no se propagan).
