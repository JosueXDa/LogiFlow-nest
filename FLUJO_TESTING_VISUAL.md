# Flujo de Testing LogiFlow - Diagrama Visual

## 🎯 Resumen Ejecutivo

**Estado actual:** ✅ Fase 1 (87.5%) | ✅ Fase 2 (77.8%)

**Todos los microservicios están corriendo:**
- ✅ API Gateway (Puerto 3009)
- ✅ Auth Service (Puerto 3001)
- ✅ Pedidos Service (Puerto 3002)
- ✅ Fleet Service (Puerto 3003)
- ✅ Inventory Service (Puerto 3004)
- ✅ Billing Service (Puerto 3005)
- ✅ Tracking Service (Puerto 3006)
- ✅ Notification Service (Puerto 3007)
- ✅ RabbitMQ (Puertos 5672/15672)

---

## 📋 Flujo de Pruebas Completo

### FASE 1: Autenticación

```
┌─────────────────────────────────────────────────────────┐
│ 1. REGISTRO Y LOGIN                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  POST /api/auth/sign-up/email                           │
│  ┌────────────────────────────────┐                     │
│  │ { name, email, password, role }│                     │
│  └────────────────────────────────┘                     │
│              │                                           │
│              ▼                                           │
│  ┌────────────────────────────────┐                     │
│  │ ✅ Usuario creado              │                     │
│  │ ✅ Session token (JWT)         │                     │
│  │ ✅ Cookie establecida          │                     │
│  └────────────────────────────────┘                     │
│              │                                           │
│              ▼                                           │
│  POST /api/auth/sign-in/email                           │
│  ┌────────────────────────────────┐                     │
│  │ { email, password }            │                     │
│  └────────────────────────────────┘                     │
│              │                                           │
│              ▼                                           │
│  ┌────────────────────────────────┐                     │
│  │ 🔑 JWT Token guardado          │                     │
│  │    (usar en próximas requests) │                     │
│  └────────────────────────────────┘                     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Verificación:**
- ✅ Status 200/201
- ✅ Token JWT válido
- ✅ Cookie `better_auth.session_token` presente

---

### FASE 2: Crear Pedido (Happy Path)

```
┌──────────────────────────────────────────────────────────────────────┐
│ 2. CREAR PEDIDO                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Cliente Autenticado                                                 │
│  POST /pedidos                                                       │
│  ┌─────────────────────────────────────┐                            │
│  │ { items, destino, tipoEntrega }     │                            │
│  └─────────────────────────────────────┘                            │
│                 │                                                    │
│                 ▼                                                    │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │         API GATEWAY (Puerto 3009)                          │     │
│  │         ✅ Valida JWT                                      │     │
│  │         ✅ Enruta a Pedidos Service                        │     │
│  └───────────────────────────────────────────────────────────┘     │
│                 │                                                    │
│                 ▼                                                    │
│  ┌───────────────────────────────────────────────────────────┐     │
│  │      PEDIDOS SERVICE (Puerto 3002)                         │     │
│  │      1. Crea pedido en DB                                  │     │
│  │      2. Estado: PENDIENTE                                  │     │
│  │      3. Emite evento: "pedido.creado"                      │     │
│  └───────────────────────────────────────────────────────────┘     │
│                 │                                                    │
│                 ├─────────────────┬─────────────────┬───────────┐   │
│                 ▼                 ▼                 ▼           ▼   │
│    ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐  ...   │
│    │ Inventory        │  │ Billing      │  │ Fleet        │        │
│    │ - Reserva Stock  │  │ - Crea       │  │ - Busca      │        │
│    │   (RESERVADO)    │  │   Factura    │  │   Repartidor │        │
│    │                  │  │   (BORRADOR) │  │              │        │
│    └─────────────────┘  └──────────────┘  └──────────────┘        │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Verificación:**
- ✅ Status 201 Created
- ✅ Pedido con ID generado
- ✅ Estado inicial: `PENDIENTE`
- ✅ Stock reservado en Inventory
- ✅ Factura borrador en Billing

---

### FASE 3: Asignación Automática

```
┌──────────────────────────────────────────────────────────────────────┐
│ 3. ASIGNACIÓN DE REPARTIDOR (Automática)                             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  RabbitMQ Queue: fleet_queue                                         │
│  Evento: "pedido.creado"                                             │
│                 │                                                     │
│                 ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │      FLEET SERVICE (Puerto 3003)                           │      │
│  │      1. Escucha evento "pedido.creado"                     │      │
│  │      2. Algoritmo de asignación:                           │      │
│  │         - Tipo de entrega → Tipo de vehículo              │      │
│  │         - Zona de cobertura                                │      │
│  │         - Estado = DISPONIBLE                              │      │
│  │         - Proximidad (si hay tracking)                     │      │
│  │      3. Asigna repartidor y vehículo                       │      │
│  │      4. Emite: "conductor.asignado"                        │      │
│  └───────────────────────────────────────────────────────────┘      │
│                 │                                                     │
│                 ▼                                                     │
│  RabbitMQ Queue: pedidos_queue                                       │
│  Evento: "conductor.asignado"                                        │
│                 │                                                     │
│                 ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │      PEDIDOS SERVICE                                       │      │
│  │      1. Actualiza pedido                                   │      │
│  │      2. Estado: PENDIENTE → ASIGNADO                       │      │
│  │      3. Vincula repartidorId y vehiculoId                  │      │
│  └───────────────────────────────────────────────────────────┘      │
│                 │                                                     │
│                 ▼                                                     │
│  RabbitMQ Queue: gateway_queue                                       │
│  Evento: "pedido.estado.actualizado"                                 │
│                 │                                                     │
│                 ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │      WEBSOCKET RELAY                                       │      │
│  │      Broadcast a clientes suscritos                        │      │
│  │      Topic: /topic/pedido/{pedidoId}                       │      │
│  └───────────────────────────────────────────────────────────┘      │
│                 │                                                     │
│                 ▼                                                     │
│  Cliente (Frontend/App) recibe notificación en TIEMPO REAL          │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  📦 Tu pedido ha sido asignado                             │      │
│  │  🚴 Repartidor: Carlos Conductor                           │      │
│  │  🏍️  Vehículo: Honda Wave 110 (ABC-123)                   │      │
│  │  ⏱️  Tiempo estimado: 25 minutos                           │      │
│  └───────────────────────────────────────────────────────────┘      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Verificación:**
- ✅ GET /pedidos/{id} muestra repartidorId
- ✅ Estado cambió a `ASIGNADO`
- ✅ WebSocket broadcast recibido (si conectado)
- ✅ Evento visible en RabbitMQ Management

---

### FASE 4: Entrega en Tiempo Real

```
┌──────────────────────────────────────────────────────────────────────┐
│ 4. ENTREGA Y TRACKING                                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Repartidor (App Móvil)                                              │
│  POST /flota/asignaciones/{id}/iniciar                               │
│                 │                                                     │
│                 ▼                                                     │
│  Estado: ASIGNADO → EN_RUTA                                          │
│  Evento: "ruta.iniciada" → WebSocket → Cliente recibe notificación  │
│                 │                                                     │
│                 ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐            │
│  │  TRACKING LOOP (cada 10-30 segundos)                │            │
│  │                                                      │            │
│  │  POST /tracking                                     │            │
│  │  { pedidoId, ubicacion: { lat, lng } }             │            │
│  │              │                                       │            │
│  │              ▼                                       │            │
│  │  Tracking Service guarda en DB                      │            │
│  │              │                                       │            │
│  │              ▼                                       │            │
│  │  Emite: "ubicacion.actualizada"                     │            │
│  │              │                                       │            │
│  │              ▼                                       │            │
│  │  WebSocket → Cliente ve marcador moverse en mapa    │            │
│  │                                                      │            │
│  └─────────────────────────────────────────────────────┘            │
│                 │                                                     │
│                 ▼                                                     │
│  Repartidor llega al destino                                         │
│  POST /flota/asignaciones/finalizar                                  │
│  { pedidoId, fotoEntrega, notasEntrega }                             │
│                 │                                                     │
│                 ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  CASCADA DE EVENTOS                                        │      │
│  │                                                             │      │
│  │  1. "entrega.completada" → Pedidos Service                 │      │
│  │     - Estado: EN_RUTA → ENTREGADO                          │      │
│  │                                                             │      │
│  │  2. "reserva.confirmar" → Inventory Service                │      │
│  │     - Confirma salida de stock                             │      │
│  │     - Reserva: RESERVADO → CONFIRMADO                      │      │
│  │                                                             │      │
│  │  3. "factura.emitir" → Billing Service                     │      │
│  │     - Factura: BORRADOR → EMITIDA                          │      │
│  │     - Calcula tiempo real de entrega                       │      │
│  │                                                             │      │
│  │  4. "pedido.estado.actualizado" → Gateway Queue            │      │
│  │     - WebSocket → Cliente recibe "ENTREGADO"               │      │
│  │                                                             │      │
│  └───────────────────────────────────────────────────────────┘      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Verificación:**
- ✅ GET /pedidos/{id} → estado = `ENTREGADO`
- ✅ GET /billing/invoices/order/{id} → estado = `EMITIDA`
- ✅ GET /inventory/reserves/pedido/{id} → estado = `CONFIRMADO`
- ✅ WebSocket: cliente recibió todas las actualizaciones

---

### FASE 5: Consultas GraphQL

```
┌──────────────────────────────────────────────────────────────────────┐
│ 5. CONSULTAS AVANZADAS (GraphQL)                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Supervisor abre Dashboard                                           │
│  http://localhost:3009/graphql                                       │
│                 │                                                     │
│                 ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  query DashboardSupervisor($zonaId: ID!) {                │      │
│  │    pedidos(filtro: { zonaId: $zonaId, estado: EN_RUTA }){ │      │
│  │      id, cliente { nombre }                                │      │
│  │      repartidor {                                          │      │
│  │        nombre                                              │      │
│  │        vehiculo { tipo, placa }  ← DataLoader (N+1 fix)   │      │
│  │        zona { nombre }           ← DataLoader (N+1 fix)   │      │
│  │      }                                                      │      │
│  │    }                                                        │      │
│  │    flotaActiva(zonaId: $zonaId) {                          │      │
│  │      total, disponibles, enRuta                            │      │
│  │    }                                                        │      │
│  │    kpiDiario(fecha: "2026-02-05", zonaId: $zonaId) {       │      │
│  │      totalPedidos, tasaExito, ingresoTotal                 │      │
│  │    }                                                        │      │
│  │  }                                                          │      │
│  └───────────────────────────────────────────────────────────┘      │
│                 │                                                     │
│                 ▼                                                     │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  APOLLO SERVER                                             │      │
│  │  1. Valida JWT                                             │      │
│  │  2. Ejecuta Resolvers:                                     │      │
│  │     - PedidosResolver                                      │      │
│  │     - FleetResolver                                        │      │
│  │     - BillingResolver                                      │      │
│  │  3. DataLoaders batch loading:                             │      │
│  │     ✅ 1 llamada para N vehículos                          │      │
│  │     ✅ 1 llamada para N zonas                              │      │
│  │     ❌ Sin DataLoader: N llamadas                          │      │
│  │  4. Combina todos los datos                                │      │
│  └───────────────────────────────────────────────────────────┘      │
│                 │                                                     │
│                 ▼                                                     │
│  Respuesta JSON completa en 1 solo request                           │
│  ┌───────────────────────────────────────────────────────────┐      │
│  │  {                                                          │      │
│  │    "data": {                                                │      │
│  │      "pedidos": [ {...}, {...} ],                          │      │
│  │      "flotaActiva": { total: 15, disponibles: 8 },         │      │
│  │      "kpiDiario": { totalPedidos: 45, tasaExito: 95.5 }    │      │
│  │    }                                                        │      │
│  │  }                                                          │      │
│  └───────────────────────────────────────────────────────────┘      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

**Ventajas GraphQL:**
- ✅ 1 request en lugar de múltiples REST calls
- ✅ Cliente pide exactamente lo que necesita (no over-fetching)
- ✅ DataLoader previene N+1 problem
- ✅ Ideal para dashboards con datos relacionados

---

## 🔌 WebSocket Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ WEBSOCKET REAL-TIME UPDATES                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Cliente Web/Móvil                                              │
│  const socket = io('ws://localhost:3009/ws')                    │
│                │                                                 │
│                ▼                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │  HANDSHAKE                                        │          │
│  │  - Envía JWT en auth.token                       │          │
│  │  - API Gateway valida sesión                     │          │
│  │  - Conexión aceptada o rechazada                 │          │
│  └──────────────────────────────────────────────────┘          │
│                │                                                 │
│                ▼                                                 │
│  socket.on('connection:success', data => {                      │
│    // Suscribirse a pedido                                      │
│    socket.emit('subscribe:pedido', { pedidoId: 'PED-001' })     │
│  })                                                              │
│                │                                                 │
│                ▼                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │  EVENTOS EN TIEMPO REAL                          │          │
│  │                                                   │          │
│  │  1. Cambios de estado:                           │          │
│  │     pedido:estado_actualizado                    │          │
│  │     { estado: "EN_RUTA", timestamp: ... }        │          │
│  │                                                   │          │
│  │  2. Ubicación del repartidor:                    │          │
│  │     ubicacion:actualizada                        │          │
│  │     { lat: -0.178, lng: -78.468 }                │          │
│  │                                                   │          │
│  │  3. Notificaciones:                              │          │
│  │     notification:new                             │          │
│  │     { message: "Tu pedido llegará en 5 min" }   │          │
│  │                                                   │          │
│  └──────────────────────────────────────────────────┘          │
│                │                                                 │
│                ▼                                                 │
│  Frontend actualiza UI automáticamente                          │
│  - Mapa con marcador del repartidor                            │
│  - Badge de estado del pedido                                   │
│  - Notificaciones toast                                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Arquitectura de Eventos (RabbitMQ)

```
┌────────────────────────────────────────────────────────────────────────┐
│ RABBITMQ EVENT CHOREOGRAPHY                                            │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   PRODUCTOR             EXCHANGE             QUEUE          CONSUMIDOR │
│                                                                         │
│  Pedidos Service  ─┐                                                   │
│                    │                                                    │
│                    ├──► pedido.creado ──► fleet_queue ──► Fleet Service│
│                    │                                                    │
│                    ├──► pedido.creado ──► billing_queue ─► Billing Svc │
│                    │                                                    │
│                    └──► pedido.creado ──► inventory_queue─► Inventory  │
│                                                                         │
│  Fleet Service ────┐                                                   │
│                    │                                                    │
│                    └──► conductor.asignado ─► pedidos_queue─► Pedidos  │
│                                                                         │
│  Tracking Service ─┐                                                   │
│                    │                                                    │
│                    └──► ubicacion.actualizada ─► gateway_queue ──┐     │
│                                                                   │     │
│  Pedidos Service ──┐                                              │     │
│                    │                                              │     │
│                    └──► pedido.estado.actualizado ─► gateway_queue ┼─► │
│                                                                   │   WebSocket
│  Billing Service ──┐                                              │   Relay   │
│                    │                                              │   Consumer│
│                    └──► factura.emitida ─► gateway_queue ────────┘     │
│                                                                         │
│                                                                         │
│  🔍 Verificar en: http://localhost:15672 (admin/admin)                 │
│     - Queues: Ver mensajes pendientes                                  │
│     - Exchanges: Ver routing                                           │
│     - Connections: Ver consumidores activos                            │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist Completo de Testing

### 1️⃣ Autenticación (REST)
```
[ ] POST /api/auth/sign-up/email → Registro cliente
[ ] POST /api/auth/sign-up/email → Registro repartidor
[ ] POST /api/auth/sign-in/email → Login exitoso
[ ] POST /api/auth/sign-in/email → Login fallido (401)
[ ] GET /api/auth/get-session → Sesión válida
```

### 2️⃣ Pedidos (REST)
```
[ ] POST /billing/calculate-tariff → Cálculo de tarifa
[ ] POST /pedidos → Crear pedido (PENDIENTE)
[ ] GET /pedidos/{id} → Ver pedido
[ ] Verificar: Stock reservado (Inventory)
[ ] Verificar: Factura borrador (Billing)
[ ] Esperar: Asignación automática (ASIGNADO)
[ ] PATCH /pedidos/{id}/estado → Actualizar a EN_RUTA
[ ] PATCH /pedidos/{id}/cancelar → Cancelar pedido
```

### 3️⃣ Flota (REST)
```
[ ] GET /flota/repartidores → Listar todos
[ ] GET /flota/repartidores/disponibles → Solo disponibles
[ ] GET /flota/vehiculos?tipo=motorizado → Por tipo
[ ] GET /flota/disponibilidad/zona/ZONA-001 → Por zona
[ ] POST /flota/asignaciones → Crear asignación manual
[ ] POST /flota/asignaciones/{id}/iniciar → Iniciar ruta
[ ] POST /flota/asignaciones/finalizar → Finalizar entrega
```

### 4️⃣ Tracking (REST)
```
[ ] POST /tracking → Actualizar ubicación
[ ] Verificar: Evento en RabbitMQ
[ ] Verificar: WebSocket broadcast enviado
```

### 5️⃣ Billing (REST)
```
[ ] GET /billing/invoices/order/{pedidoId} → Factura de pedido
[ ] POST /billing/invoices/{id}/payment → Registrar pago
[ ] GET /billing/daily-report?date=YYYY-MM-DD → Reporte diario
```

### 6️⃣ GraphQL (Apollo Playground)
```
[ ] query pedidos → Listar con filtros
[ ] query repartidores → Con vehículo y zona (DataLoader)
[ ] query flotaActiva → Resumen por zona
[ ] query kpiDiario → Métricas del día
[ ] Verificar en logs: Solo 1 llamada al microservicio por tipo
[ ] query sin autenticación → Error 401
```

### 7️⃣ WebSocket (Browser/Postman)
```
[ ] Conectar con JWT válido → connection:success
[ ] Conectar sin JWT → connection:error
[ ] emit('subscribe:pedido') → Suscripción exitosa
[ ] Actualizar pedido → socket.on('pedido:estado_actualizado')
[ ] Enviar ubicación → socket.on('ubicacion:actualizada')
[ ] Desconectar y reconectar → Funciona correctamente
```

### 8️⃣ Eventos (RabbitMQ Management)
```
[ ] Abrir http://localhost:15672
[ ] Verificar colas activas: fleet_queue, billing_queue, etc.
[ ] Crear pedido → Ver evento en queues
[ ] Verificar consumidores conectados
[ ] Ver dead letter queue (si hay errores)
```

---

## 🚨 Pendientes Críticos

### ⚠️ FASE 1 (87.5% completo)

#### 1. Rate Limiting (CRÍTICO)
```bash
pnpm add @nestjs/throttler --filter=api-gateway
```

**Implementar en:** `apps/api-gateway/src/app.module.ts`
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100, // 100 requests por minuto
    }),
    // ... otros imports
  ],
})
```

#### 2. OpenAPI/Swagger Documentation (CRÍTICO)
```bash
pnpm add @nestjs/swagger --filter=api-gateway
```

**Configurar en:** `apps/api-gateway/src/main.ts`
```typescript
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('LogiFlow API')
  .setDescription('API Gateway para EntregaExpress')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

**Acceso:** http://localhost:3009/docs

---

### ⚠️ FASE 2 (77.8% completo)

#### 3. Notification Service Completo (IMPORTANTE)
Actualmente solo hace logs. Necesita:
- [ ] Integración con Twilio (SMS)
- [ ] Integración con SendGrid (Email)
- [ ] Push Notifications con Firebase
- [ ] Templates de mensajes

#### 4. Implementar Saga Pattern (IMPORTANTE)
Para operaciones distribuidas complejas:
- [ ] Saga de cancelación de pedido EN_RUTA
- [ ] Compensaciones: reembolso, liberación de stock, etc.
- [ ] Estado de saga en base de datos
- [ ] Retry logic y dead letter handling

#### 5. Monitoreo (OPCIONAL pero recomendado)
```bash
pnpm add prom-client
```
- [ ] Prometheus para métricas
- [ ] Grafana para visualización
- [ ] Dashboards de latencia, throughput, errors

---

## 📦 Archivos de Testing Creados

```
LogiFlow-nest/
├── GUIA_TESTING_COMPLETA.md          ← Guía detallada paso a paso
├── GRAPHQL_QUERIES.md                 ← Queries para Apollo Playground
├── FLUJO_TESTING_VISUAL.md            ← Este archivo (diagramas visuales)
└── postman/
    └── LogiFlow-API.postman_collection.json  ← Importar en Postman
```

### 🎯 Cómo usar estos archivos:

1. **Importar colección de Postman:**
   - Abrir Postman
   - File → Import
   - Seleccionar `postman/LogiFlow-API.postman_collection.json`
   - Configurar variables de entorno

2. **Testing en Apollo Playground:**
   - Abrir http://localhost:3009/graphql
   - Copiar queries de `GRAPHQL_QUERIES.md`
   - Agregar JWT en HTTP Headers
   - Ejecutar queries

3. **Testing de WebSocket:**
   - Abrir `apps/api-gateway/src/websocket/websocket-test.html` en navegador
   - O usar Postman WebSocket Request
   - Conectar con JWT token

---

## 🏁 Orden Recomendado de Testing

```
1. ✅ Autenticación (Postman)
   └─► Obtener JWT token
   
2. ✅ Seed de datos (Scripts)
   └─► node scripts/seed-fleet.mjs
   └─► node scripts/seed-inventory.mjs
   
3. ✅ Crear pedido (Postman)
   └─► Verificar estado PENDIENTE
   └─► Verificar asignación automática → ASIGNADO
   
4. ✅ Tracking en tiempo real (Postman + WebSocket)
   └─► Conectar WebSocket
   └─► Suscribirse al pedido
   └─► Enviar actualizaciones de ubicación
   └─► Verificar broadcast en WebSocket
   
5. ✅ GraphQL consultas (Apollo Playground)
   └─► Dashboard supervisor
   └─► Verificar DataLoader en logs
   
6. ✅ Finalizar entrega (Postman)
   └─► Estado → ENTREGADO
   └─► Factura → EMITIDA
   └─► Stock → CONFIRMADO
   
7. ✅ RabbitMQ verification
   └─► Abrir Management UI
   └─► Ver queues y eventos
```

---

## 📞 Soporte y Debugging

### Logs útiles:
```powershell
# API Gateway
pnpm --filter api-gateway dev

# Fleet Service (asignaciones)
pnpm --filter fleet-service start:dev

# Pedidos Service (estados)
pnpm --filter pedidos-service start:dev
```

### RabbitMQ Management:
```
URL: http://localhost:15672
User: admin
Pass: admin

Verificar:
- Queues → Messages ready
- Connections → Consumers
- Exchanges → Bindings
```

### PostgreSQL (si necesitas verificar datos):
```powershell
docker exec -it logiflow-postgres psql -U postgres -d auth_db
```

---

**Última actualización:** 5 de febrero de 2026
**Versión:** 1.0.0
**Estado:** ✅ Listo para testing completo
