# Guía Completa de Testing - LogiFlow

## 📋 Índice
1. [Configuración Initial](#1-configuración-inicial)
2. [Flujo de Autenticación](#2-flujo-de-autenticación)
3. [Flujo Completo de Pedido (Happy Path)](#3-flujo-completo-de-pedido-happy-path)
4. [Pruebas GraphQL](#4-pruebas-graphql)
5. [Pruebas WebSocket](#5-pruebas-websocket)
6. [Verificación de Requisitos Fase 1 & 2](#6-verificación-de-requisitos-fase-1--2)

---

## 1. Configuración Inicial

### URLs Base
```
API Gateway (REST):    http://localhost:3009
GraphQL Playground:    http://localhost:3009/graphql
WebSocket Server:      ws://localhost:3009/ws
```

### Puertos de Microservicios (directo - solo para debug)
```
Auth Service:          localhost:3001
Pedidos Service:       localhost:3002
Fleet Service:         localhost:3003
Inventory Service:     localhost:3004
Billing Service:       localhost:3005
Tracking Service:      localhost:3006
Notification Service:  localhost:3007
RabbitMQ Management:   http://localhost:15672 (admin/admin)
```

### Variables de Entorno para Postman
```json
{
  "base_url": "http://localhost:3009",
  "graphql_url": "http://localhost:3009/graphql",
  "ws_url": "ws://localhost:3009/ws",
  "access_token": "",
  "pedido_id": "",
  "repartidor_id": "",
  "vehiculo_id": ""
}
```

---

## 2. Flujo de Autenticación

### 2.1. Registro de Usuario Cliente

**REQUEST:**
```http
POST http://localhost:3009/api/auth/sign-up/email
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "password": "Password123!",
  "role": "cliente"
}
```

**RESPONSE ESPERADA:**
```json
{
  "user": {
    "id": "uuid-generado",
    "email": "juan.perez@example.com",
    "name": "Juan Pérez",
    "role": "cliente"
  },
  "session": {
    "token": "jwt-token-here",
    "expiresAt": "2026-02-06T12:00:00.000Z"
  }
}
```

**VERIFICACIÓN:**
- ✅ Status Code: 201 Created
- ✅ Cookie `better_auth.session_token` establecida
- ✅ Role = "cliente"

---

### 2.2. Registro de Repartidor

**REQUEST:**
```http
POST http://localhost:3009/api/auth/sign-up/email
Content-Type: application/json

{
  "name": "Carlos Conductor",
  "email": "carlos.conductor@example.com",
  "password": "Password123!",
  "role": "repartidor"
}
```

---

### 2.3. Login

**REQUEST:**
```http
POST http://localhost:3009/api/auth/sign-in/email
Content-Type: application/json

{
  "email": "juan.perez@example.com",
  "password": "Password123!"
}
```

**RESPONSE ESPERADA:**
```json
{
  "user": {
    "id": "uuid",
    "email": "juan.perez@example.com",
    "name": "Juan Pérez",
    "role": "cliente"
  },
  "session": {
    "token": "jwt-token-aqui",
    "expiresAt": "..."
  }
}
```

**POSTMAN SCRIPT (Tests):**
```javascript
// Guardar el token para próximas requests
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("access_token", jsonData.session.token);
    console.log("✅ Token guardado:", jsonData.session.token);
}
```

---

### 2.4. Validar Sesión

**REQUEST:**
```http
GET http://localhost:3009/api/auth/get-session
Cookie: better_auth.session_token={{access_token}}
```

**VERIFICACIÓN:**
- ✅ Devuelve datos del usuario autenticado
- ✅ Status 200 si hay sesión válida
- ✅ Status 401 si no hay sesión

---

## 3. Flujo Completo de Pedido (Happy Path)

Este flujo demuestra el ciclo de vida completo de un pedido según los requerimientos de EntregaExpress.

### 3.1. Seed de Datos (Preparación)

**Ejecutar scripts de seed:**
```powershell
# Desde la raíz del proyecto
node scripts/seed-fleet.mjs       # Crea repartidores y vehículos
node scripts/seed-inventory.mjs   # Crea productos en inventario
```

**VERIFICACIÓN:**
```http
GET http://localhost:3009/flota/repartidores/disponibles
GET http://localhost:3009/inventory/products
```

---

### 3.2. Calcular Tarifa (Opcional)

**REQUEST:**
```http
POST http://localhost:3009/billing/calculate-tariff
Content-Type: application/json
Authorization: Bearer {{access_token}}

{
  "tipoEntrega": "urbana",
  "distanciaKm": 5.2,
  "peso": 2.5,
  "fragil": false,
  "zonaId": "ZONA-001"
}
```

**RESPONSE ESPERADA:**
```json
{
  "tarifaBase": 3.50,
  "adicionalDistancia": 2.60,
  "adicionalPeso": 0.50,
  "adicionalFragil": 0,
  "total": 6.60,
  "moneda": "USD"
}
```

---

### 3.3. Crear Pedido

**REQUEST:**
```http
POST http://localhost:3009/pedidos
Content-Type: application/json
Authorization: Bearer {{access_token}}

{
  "items": [
    {
      "productoId": "PROD-001",
      "cantidad": 2
    }
  ],
  "destino": {
    "lat": -0.180653,
    "lng": -78.467838,
    "direccion": "Av. 10 de Agosto N35-10 y Villalengua, Quito",
    "referencia": "Edificio azul, segundo piso"
  },
  "tipoEntrega": "urbana",
  "clienteId": "uuid-del-cliente",
  "zonaId": "ZONA-001"
}
```

**RESPONSE ESPERADA:**
```json
{
  "id": "PED-20260205-001",
  "estado": "PENDIENTE",
  "items": [...],
  "destino": {...},
  "createdAt": "2026-02-05T...",
  "estimatedDeliveryTime": "30-45 min"
}
```

**POSTMAN SCRIPT (Tests):**
```javascript
if (pm.response.code === 201) {
    const pedido = pm.response.json();
    pm.environment.set("pedido_id", pedido.id);
    console.log("✅ Pedido creado:", pedido.id);
    
    // Verificar estado inicial
    pm.test("Estado inicial es PENDIENTE", () => {
        pm.expect(pedido.estado).to.eql("PENDIENTE");
    });
}
```

**EVENTOS GENERADOS (verificar en RabbitMQ):**
- ✅ `pedido.creado` → Queue: `fleet_queue`, `billing_queue`, `notification_queue`
- ✅ Stock reservado en Inventory Service
- ✅ Factura borrador creada en Billing Service

---

### 3.4. Verificar Estado del Pedido

**REQUEST:**
```http
GET http://localhost:3009/pedidos/{{pedido_id}}
Authorization: Bearer {{access_token}}
```

**RESPONSE ESPERADA:**
```json
{
  "id": "PED-20260205-001",
  "estado": "PENDIENTE",
  "items": [...],
  "destino": {...},
  "factura": {
    "id": "FAC-001",
    "estado": "BORRADOR",
    "total": 6.60
  },
  "reservaStock": {
    "id": "RES-001",
    "estado": "RESERVADO"
  }
}
```

---

### 3.5. Sistema Asigna Repartidor (Automático)

**DESCRIPCIÓN:**
El Fleet Service escucha el evento `pedido.creado` y automáticamente busca un repartidor disponible según:
- Tipo de entrega (urbana → motorizado, intermunicipal → auto, nacional → camión)
- Zona de cobertura
- Disponibilidad (estado = DISPONIBLE)
- Proximidad (si tiene tracking)

**EVENTO EMITIDO:**
```json
{
  "pattern": "conductor.asignado",
  "data": {
    "pedidoId": "PED-20260205-001",
    "conductorId": "REP-001",
    "vehiculoId": "VEH-001",
    "tiempoEstimado": "25 min"
  }
}
```

**VERIFICAR ASIGNACIÓN:**
```http
GET http://localhost:3009/pedidos/{{pedido_id}}
Authorization: Bearer {{access_token}}
```

**RESPONSE ESPERADA (actualizada):**
```json
{
  "id": "PED-20260205-001",
  "estado": "ASIGNADO",  // ✅ Cambió de PENDIENTE a ASIGNADO
  "repartidor": {
    "id": "REP-001",
    "nombre": "Carlos Conductor",
    "telefono": "+593987654321",
    "vehiculo": {
      "tipo": "motorizado",
      "placa": "ABC-123"
    }
  }
}
```

---

### 3.6. Repartidor Inicia Entrega

**REQUEST (simulando app móvil del repartidor):**
```http
POST http://localhost:3009/flota/asignaciones/{{pedido_id}}/iniciar
Authorization: Bearer {{repartidor_token}}
Content-Type: application/json

{
  "ubicacionActual": {
    "lat": -0.180653,
    "lng": -78.467838
  }
}
```

**RESPONSE ESPERADA:**
```json
{
  "pedidoId": "PED-20260205-001",
  "estado": "EN_RUTA",
  "iniciadoEn": "2026-02-05T14:30:00.000Z"
}
```

**EVENTO EMITIDO:**
```json
{
  "pattern": "ruta.iniciada",
  "data": {
    "pedidoId": "PED-20260205-001",
    "repartidorId": "REP-001",
    "timestamp": "2026-02-05T14:30:00.000Z"
  }
}
```

---

### 3.7. Actualizar Ubicación en Tiempo Real

**REQUEST:**
```http
POST http://localhost:3009/tracking
Authorization: Bearer {{repartidor_token}}
Content-Type: application/json

{
  "pedidoId": "PED-20260205-001",
  "repartidorId": "REP-001",
  "ubicacion": {
    "lat": -0.178900,
    "lng": -78.468500
  },
  "velocidad": 35.5,
  "heading": 180
}
```

**RESPONSE ESPERADA:**
```json
{
  "success": true,
  "timestamp": "2026-02-05T14:35:00.000Z"
}
```

**EVENTO EMITIDO:**
```json
{
  "pattern": "ubicacion.actualizada",
  "data": {
    "pedidoId": "PED-20260205-001",
    "repartidorId": "REP-001",
    "ubicacion": {...},
    "timestamp": "..."
  }
}
```

**VERIFICACIÓN WebSocket:**
Los clientes suscritos al pedido recibirán esta actualización en tiempo real (ver sección 5).

---

### 3.8. Finalizar Entrega

**REQUEST:**
```http
POST http://localhost:3009/flota/asignaciones/finalizar
Authorization: Bearer {{repartidor_token}}
Content-Type: application/json

{
  "pedidoId": "PED-20260205-001",
  "ubicacionFinal": {
    "lat": -0.180653,
    "lng": -78.467838
  },
  "fotoEntrega": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "notasEntrega": "Entregado al cliente. Todo en orden."
}
```

**RESPONSE ESPERADA:**
```json
{
  "pedidoId": "PED-20260205-001",
  "estado": "ENTREGADO",
  "finalizadoEn": "2026-02-05T15:00:00.000Z",
  "duracionMinutos": 30
}
```

**EVENTOS EMITIDOS:**
- `entrega.completada` → Pedidos Service actualiza estado a ENTREGADO
- `reserva.confirmar` → Inventory Service confirma salida de stock
- `factura.emitir` → Billing Service emite factura final

---

### 3.9. Verificar Factura Final

**REQUEST:**
```http
GET http://localhost:3009/billing/invoices/order/{{pedido_id}}
Authorization: Bearer {{access_token}}
```

**RESPONSE ESPERADA:**
```json
{
  "id": "FAC-001",
  "numero": "001-001-000001",
  "estado": "EMITIDA",
  "pedidoId": "PED-20260205-001",
  "subtotal": 6.00,
  "iva": 0.60,
  "total": 6.60,
  "detalles": [
    {
      "concepto": "Entrega urbana - 5.2 km",
      "monto": 6.00
    }
  ],
  "emitidaEn": "2026-02-05T15:00:00.000Z",
  "linkPDF": "/billing/invoices/FAC-001/pdf"
}
```

---

## 4. Pruebas GraphQL

### 4.1. Acceder al Playground

**URL:**
```
http://localhost:3009/graphql
```

**Autenticación:**
Agregar en HTTP Headers (esquina inferior izquierda del playground):
```json
{
  "Authorization": "Bearer tu-jwt-token-aqui"
}
```

---

### 4.2. Consulta: Dashboard de Supervisor

**QUERY:**
```graphql
query DashboardSupervisor($zonaId: ID!) {
  # Lista de pedidos en la zona
  pedidos(filtro: { zonaId: $zonaId, estado: EN_RUTA }) {
    id
    estado
    createdAt
    cliente {
      nombre
      telefono
    }
    destino {
      direccion
      lat
      lng
    }
    repartidor {
      id
      nombre
      telefono
      vehiculo {
        tipo
        placa
        modelo
      }
    }
    tiempoTranscurrido
    retrasoEstimadoMin
  }
  
  # Resumen de flota activa
  flotaActiva(zonaId: $zonaId) {
    total
    disponibles
    enRuta
    enMantenimiento
  }
  
  # KPIs del día
  kpiDiario(fecha: "2026-02-05", zonaId: $zonaId) {
    fecha
    totalPedidos
    pedidosEntregados
    pedidosCancelados
    tasaExito
    ingresoTotal
    tiempoPromedioEntrega
  }
}
```

**VARIABLES:**
```json
{
  "zonaId": "ZONA-001"
}
```

**RESPONSE ESPERADA:**
```json
{
  "data": {
    "pedidos": [
      {
        "id": "PED-20260205-001",
        "estado": "EN_RUTA",
        "createdAt": "2026-02-05T14:00:00.000Z",
        "cliente": {
          "nombre": "Juan Pérez",
          "telefono": "+593987654321"
        },
        "destino": {
          "direccion": "Av. 10 de Agosto N35-10",
          "lat": -0.180653,
          "lng": -78.467838
        },
        "repartidor": {
          "id": "REP-001",
          "nombre": "Carlos Conductor",
          "telefono": "+593987654322",
          "vehiculo": {
            "tipo": "motorizado",
            "placa": "ABC-123",
            "modelo": "Honda Wave 110"
          }
        },
        "tiempoTranscurrido": 25,
        "retrasoEstimadoMin": 0
      }
    ],
    "flotaActiva": {
      "total": 15,
      "disponibles": 8,
      "enRuta": 6,
      "enMantenimiento": 1
    },
    "kpiDiario": {
      "fecha": "2026-02-05",
      "totalPedidos": 45,
      "pedidosEntregados": 42,
      "pedidosCancelados": 1,
      "tasaExito": 95.5,
      "ingresoTotal": 285.40,
      "tiempoPromedioEntrega": 32.5
    }
  }
}
```

**VERIFICACIÓN DataLoader (N+1 Prevention):**
- ✅ Abrir Network tab en DevTools
- ✅ Ejecutar query que pida múltiples pedidos con repartidor
- ✅ Verificar que solo haya 1 llamada al Fleet Service (batch loading)

---

### 4.3. Consulta: Lista de Repartidores con Vehículos

**QUERY:**
```graphql
query RepartidoresDisponibles {
  repartidores(filtro: { estado: DISPONIBLE }) {
    id
    nombre
    telefono
    estado
    zona {
      id
      nombre
      cobertura
    }
    vehiculo {
      id
      tipo
      placa
      modelo
      anio
      capacidadKg
      estado
    }
    calificacionPromedio
    totalEntregas
  }
}
```

**RESPONSE ESPERADA:**
```json
{
  "data": {
    "repartidores": [
      {
        "id": "REP-002",
        "nombre": "María Repartidora",
        "telefono": "+593987654323",
        "estado": "DISPONIBLE",
        "zona": {
          "id": "ZONA-001",
          "nombre": "Quito Norte",
          "cobertura": "Centro, La Carolina, Iñaquito"
        },
        "vehiculo": {
          "id": "VEH-002",
          "tipo": "motorizado",
          "placa": "DEF-456",
          "modelo": "Yamaha XTZ 125",
          "anio": 2023,
          "capacidadKg": 25.0,
          "estado": "DISPONIBLE"
        },
        "calificacionPromedio": 4.8,
        "totalEntregas": 156
      }
    ]
  }
}
```

---

### 4.4. Consulta: Vehículos por Tipo

**QUERY:**
```graphql
query VehiculosPorTipo($tipo: TipoVehiculo!) {
  vehiculos(filtro: { tipo: $tipo, estado: DISPONIBLE }) {
    id
    tipo
    placa
    marca
    modelo
    anio
    capacidadKg
    estado
    repartidorActual {
      id
      nombre
    }
  }
}
```

**VARIABLES:**
```json
{
  "tipo": "motorizado"
}
```

---

### 4.5. Consulta: Zonas de Cobertura

**QUERY:**
```graphql
query ZonasCobertura {
  zonas {
    id
    nombre
    cobertura
    activa
    repartidoresActivos
  }
}
```

---

## 5. Pruebas WebSocket

### 5.1. Prueba con HTML Test Client

**ARCHIVO:** `apps/api-gateway/src/websocket/websocket-test.html`

**PASOS:**
1. Abrir el archivo en un navegador
2. Ingresar el token JWT obtenido en el login
3. Conectar al WebSocket
4. Suscribirse a un pedido activo

**VERIFICAR:**
- ✅ Mensaje de conexión exitosa
- ✅ Recepción de eventos en tiempo real

---

### 5.2. Prueba con Postman

**1. Crear WebSocket Request:**
- New → WebSocket Request
- URL: `ws://localhost:3009/ws`
- Connect

**2. Authentication:**
En el handshake, enviar:
```json
{
  "auth": {
    "token": "tu-jwt-token-aqui"
  }
}
```

**3. Suscribirse a Pedido:**
Enviar mensaje:
```json
{
  "event": "subscribe:pedido",
  "data": {
    "pedidoId": "PED-20260205-001"
  }
}
```

**4. Escuchar Eventos:**
Deberías recibir eventos como:
```json
{
  "event": "pedido:estado_actualizado",
  "data": {
    "pedidoId": "PED-20260205-001",
    "estado": "EN_RUTA",
    "timestamp": "2026-02-05T14:30:00.000Z"
  }
}
```

```json
{
  "event": "ubicacion:actualizada",
  "data": {
    "pedidoId": "PED-20260205-001",
    "repartidorId": "REP-001",
    "ubicacion": {
      "lat": -0.178900,
      "lng": -78.468500
    },
    "timestamp": "2026-02-05T14:35:00.000Z"
  }
}
```

---

### 5.3. Prueba con Socket.io Client (JavaScript)

**CÓDIGO:**
```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3009/ws', {
  withCredentials: true,
  auth: {
    token: 'tu-jwt-token-aqui'
  }
});

// Escuchar conexión exitosa
socket.on('connection:success', (data) => {
  console.log('✅ Conectado:', data);
  
  // Suscribirse a pedido
  socket.emit('subscribe:pedido', {
    pedidoId: 'PED-20260205-001'
  });
});

// Escuchar actualizaciones de pedido
socket.on('pedido:estado_actualizado', (data) => {
  console.log('📦 Estado actualizado:', data);
});

// Escuchar ubicación en tiempo real
socket.on('ubicacion:actualizada', (data) => {
  console.log('📍 Nueva ubicación:', data);
});

// Errores
socket.on('connection:error', (error) => {
  console.error('❌ Error:', error);
});
```

---

## 6. Verificación de Requisitos Fase 1 & 2

### ✅ Fase 1: Backend — Servicios REST y API Gateway

| Requisito | Implementado | Endpoint/Evidencia |
|-----------|--------------|-------------------|
| **AuthService**: Login, Register, Token Refresh | ✅ | `/api/auth/sign-in/email`, `/api/auth/sign-up/email` |
| **PedidoService**: CRUD de pedidos | ✅ | `POST /pedidos`, `GET /pedidos/:id`, `PATCH /pedidos/:id/cancelar` |
| **FleetService**: Gestión de repartidores y vehículos | ✅ | `/flota/repartidores`, `/flota/vehiculos` |
| **BillingService**: Cálculo de tarifas y facturas | ✅ | `/billing/calculate-tariff`, `/billing/invoices` |
| **API Gateway**: Enrutamiento centralizado | ✅ | Puerto 3009, todos los endpoints bajo `/api/*` |
| **Validación JWT**: En todas las rutas protegidas | ✅ | `AuthGuard` aplicado globalmente |
| **Rate Limiting**: 100 req/min por cliente | ⚠️ | **PENDIENTE** - Falta implementar `@nestjs/throttler` |
| **Transacciones ACID**: En operaciones de escritura | ✅ | `@Transactional` en servicios críticos |
| **Documentación OpenAPI 3.0**: Swagger UI | ⚠️ | **PENDIENTE** - Falta configurar `/swagger-ui` |

---

### ✅ Fase 2: Backend — GraphQL, Mensajería y WebSocket

| Requisito | Implementado | Endpoint/Evidencia |
|-----------|--------------|-------------------|
| **API GraphQL**: Schema con tipos relacionados | ✅ | `/graphql` - Tipos: Pedido, Repartidor, Vehiculo, Zona, KPI |
| **Resolvers eficientes**: DataLoaders para N+1 | ✅ | `RepartidorLoader`, `VehiculoLoader`, `ZonaLoader` |
| **Queries implementadas**: Dashboard supervisor | ✅ | `pedidos()`, `flotaActiva()`, `kpiDiario()` |
| **RabbitMQ**: Sistema de mensajería | ✅ | Colas: `gateway_queue`, `fleet_queue`, `billing_queue`, `notification_queue` |
| **Eventos clave**: pedido.creado, conductor.asignado, etc. | ✅ | Productores en Pedidos, Fleet, Tracking |
| **NotificationService**: Consumidor de eventos | ⚠️ | **PARCIAL** - Consume eventos pero no envía SMS/email reales |
| **WebSocket Server**: Endpoint `/ws` con JWT | ✅ | `ws://localhost:3009/ws` - Handshake autenticado |
| **Broadcast selectivo**: Suscripción por tópicos | ✅ | `/topic/pedido/:id`, `/topic/zona/:id` |
| **Relay WebSocket**: Consumo de RabbitMQ | ✅ | `WebSocketRelayConsumer` conectado a `gateway_queue` |
| **Monitoreo de colas**: Prometheus + Grafana | ❌ | **PENDIENTE** - No implementado |

---

### 📊 Resumen de Estado

**FASE 1**: 87.5% Completo
- ✅ 7/8 requisitos implementados
- ⚠️ Falta: Rate Limiting, OpenAPI/Swagger

**FASE 2**: 77.8% Completo
- ✅ 7/9 requisitos implementados
- ⚠️ Parcial: NotificationService (solo logs, no SMS/email)
- ❌ Falta: Monitoreo con Prometheus/Grafana

---

## 7. Scripts de Testing Automatizado

### 7.1. Flujo Completo Simulado

**EJECUTAR:**
```powershell
node scripts/simulate-order-flow.mjs
```

**QUÉ HACE:**
1. Crea productos en inventario
2. Crea repartidores y vehículos
3. Crea un pedido
4. Simula asignación de repartidor
5. Simula actualizaciones de ubicación
6. Finaliza la entrega
7. Verifica la factura

**VERIFICAR:**
- ✅ Todos los pasos completan sin errores
- ✅ El pedido termina en estado ENTREGADO
- ✅ La factura está en estado EMITIDA

---

### 7.2. Test de Tracking

**EJECUTAR:**
```powershell
node scripts/test-tracking.mjs
```

**QUÉ HACE:**
- Envía 10 actualizaciones de ubicación
- Verifica que se reciban en WebSocket
- Mide latencia de eventos

---

## 8. Checklist de Pruebas Completas

### 🔐 Autenticación
- [ ] Registro de cliente exitoso
- [ ] Registro de repartidor exitoso
- [ ] Login con credenciales válidas
- [ ] Rechazo de login con credenciales inválidas (401)
- [ ] Token JWT incluye claims correctos (role, userId)
- [ ] Cookie de sesión se establece correctamente

### 📦 Pedidos
- [ ] Crear pedido con items válidos
- [ ] Verificar reserva de stock automática
- [ ] Verificar creación de factura borrador
- [ ] Sistema asigna repartidor automáticamente
- [ ] Estado cambia de PENDIENTE → ASIGNADO → EN_RUTA → ENTREGADO
- [ ] Cancelar pedido antes de asignación
- [ ] Intentar cancelar pedido EN_RUTA (saga de compensación)

### 🚚 Flota
- [ ] Listar repartidores disponibles
- [ ] Listar vehículos por tipo
- [ ] Actualizar estado de repartidor (DISPONIBLE ↔ EN_RUTA)
- [ ] Consultar disponibilidad por zona

### 💰 Facturación
- [ ] Calcular tarifa antes de crear pedido
- [ ] Factura se crea en estado BORRADOR automáticamente
- [ ] Factura se emite al completar entrega
- [ ] Registrar pago de factura
- [ ] Anular factura con motivo
- [ ] Generar reporte diario

### 📊 GraphQL
- [ ] Consultar pedidos con filtros (zona, estado)
- [ ] Consultar flota activa por zona
- [ ] Consultar KPIs diarios
- [ ] Verificar DataLoader previene N+1 (1 query para múltiples pedidos)
- [ ] Consultar repartidores con vehículos y zonas
- [ ] Error handling (consulta sin autenticación → 401)

### 🔌 WebSocket
- [ ] Conexión exitosa con JWT válido
- [ ] Rechazo de conexión sin JWT (401)
- [ ] Suscripción a pedido específico
- [ ] Recibir evento de cambio de estado
- [ ] Recibir evento de ubicación actualizada
- [ ] Recibir evento de conductor asignado
- [ ] Desconexión y reconexión automática
- [ ] Broadcast solo a clientes suscritos (no a todos)

### 🐰 RabbitMQ
- [ ] Eventos se publican en las colas correctas
- [ ] Consumidores procesan eventos sin errores
- [ ] Dead Letter Queue maneja mensajes fallidos
- [ ] Verificar en management UI: http://localhost:15672

### 🛡️ Seguridad
- [ ] Endpoints protegidos rechazan requests sin token (401)
- [ ] Endpoints rechazan tokens expirados (401)
- [ ] Endpoints verifican roles (cliente no puede acceder a rutas de supervisor)
- [ ] Rate limiting funciona (después de implementar)

---

## 9. Endpoints Prioritarios para Postman Collection

### Collection Structure Sugerida

```
LogiFlow API
├── 1. Auth
│   ├── Register Cliente
│   ├── Register Repartidor
│   ├── Login
│   └── Get Session
├── 2. Pedidos (Happy Path)
│   ├── Calculate Tariff
│   ├── Create Pedido
│   ├── Get Pedido
│   ├── Update Estado
│   └── Cancel Pedido
├── 3. Flota
│   ├── List Repartidores
│   ├── List Vehiculos
│   ├── Get Disponibilidad por Zona
│   ├── Create Asignacion
│   ├── Iniciar Ruta
│   └── Finalizar Entrega
├── 4. Tracking
│   └── Update Ubicacion
├── 5. Billing
│   ├── Get Factura by Pedido
│   ├── Register Payment
│   └── Daily Report
├── 6. Inventory
│   ├── List Products
│   └── Check Stock
└── 7. GraphQL
    ├── Dashboard Supervisor
    ├── Repartidores Disponibles
    └── KPIs Diario
```

---

## 10. Próximos Pasos (Pendientes Fase 1 & 2)

### CRÍTICO (Requisitos de Fase 1)
1. **Implementar Rate Limiting**:
   ```bash
   pnpm add @nestjs/throttler --filter=api-gateway
   ```
   - Configurar 100 req/min por cliente
   - Aplicar en API Gateway

2. **Configurar OpenAPI/Swagger**:
   ```bash
   pnpm add @nestjs/swagger --filter=api-gateway
   ```
   - Decorar controllers con `@ApiTags`, `@ApiOperation`
   - Exponer en `/swagger-ui` o `/docs`

### IMPORTANTE (Requisitos de Fase 2)
3. **Completar NotificationService**:
   - Integrar Twilio para SMS
   - Integrar SendGrid para emails
   - Implementar push notifications (Firebase)

4. **Implementar Saga Pattern**:
   - Saga Orquestada para cancelación de pedidos EN_RUTA
   - Compensaciones: liberar stock, reembolsar, liberar repartidor

### OPCIONAL (Mejoras)
5. Monitoreo con Prometheus + Grafana
6. Pruebas E2E con Jest
7. CI/CD Pipeline

---

## 📝 Notas Finales

- **Todos los microservicios deben estar corriendo** antes de iniciar pruebas
- **RabbitMQ debe estar activo** para eventos asíncronos
- **PostgreSQL** debe tener las bases de datos creadas
- Los **seeds** deben ejecutarse para tener datos de prueba

**Para ver logs de eventos en tiempo real:**
```powershell
# Terminal 1: Logs del API Gateway
pnpm --filter api-gateway dev

# Terminal 2: Logs del Fleet Service
pnpm --filter fleet-service start:dev

# Terminal 3: RabbitMQ Management
# Abrir http://localhost:15672 en navegador
```

---

**Última actualización:** 5 de febrero de 2026
