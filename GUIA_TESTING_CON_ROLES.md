# 🔐 Guía de Testing con Control de Roles (ACTUALIZADO)

## ⚠️ CAMBIO IMPORTANTE

Tu compañero implementó el sistema de roles. Ahora **cada endpoint requiere un rol específico** para acceder. Esta guía actualiza las pruebas de Postman.

---

## 📋 Paso 1: Crear Usuarios para cada Rol

### 1.1. Cliente (para pedidos)

```http
POST http://localhost:3009/api/auth/sign-up/email
Content-Type: application/json

{
  "name": "Juan Cliente",
  "email": "cliente@test.com",
  "password": "Test123!",
  "role": "CLIENTE"
}
```

**Postman Script (Tests):**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token_cliente", jsonData.session.token);
    console.log("✅ Token CLIENTE guardado");
}
```

---

### 1.2. Repartidor (para entregas)

```http
POST http://localhost:3009/api/auth/sign-up/email
Content-Type: application/json

{
  "name": "Carlos Repartidor",
  "email": "repartidor@test.com",
  "password": "Test123!",
  "role": "REPARTIDOR"
}
```

**Postman Script (Tests):**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token_repartidor", jsonData.session.token);
    console.log("✅ Token REPARTIDOR guardado");
}
```

---

### 1.3. Supervisor (para asignaciones)

```http
POST http://localhost:3009/api/auth/sign-up/email
Content-Type: application/json

{
  "name": "Ana Supervisor",
  "email": "supervisor@test.com",
  "password": "Test123!",
  "role": "SUPERVISOR"
}
```

**Postman Script (Tests):**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token_supervisor", jsonData.session.token);
    console.log("✅ Token SUPERVISOR guardado");
}
```

---

### 1.4. Gerente (para administración)

```http
POST http://localhost:3009/api/auth/sign-up/email
Content-Type: application/json

{
  "name": "María Gerente",
  "email": "gerente@test.com",
  "password": "Test123!",
  "role": "GERENTE"
}
```

**Postman Script (Tests):**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token_gerente", jsonData.session.token);
    console.log("✅ Token GERENTE guardado");
}
```

---

### 1.5. Admin (acceso total)

```http
POST http://localhost:3009/api/auth/sign-up/email
Content-Type: application/json

{
  "name": "Pedro Admin",
  "email": "admin@test.com",
  "password": "Test123!",
  "role": "ADMIN"
}
```

**Postman Script (Tests):**
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const jsonData = pm.response.json();
    pm.environment.set("token_admin", jsonData.session.token);
    console.log("✅ Token ADMIN guardado");
}
```

---

## 🔄 Paso 2: Actualizar Headers en Postman

Ahora en cada request de Postman, debes usar el **token correcto** según el endpoint:

### Ejemplo: Crear Pedido (requiere CLIENTE)

```http
POST http://localhost:3009/api/pedidos
Authorization: Bearer {{token_cliente}}
Content-Type: application/json

{
  "clienteId": "...",
  "items": [...]
}
```

### Ejemplo: Confirmar Pedido (requiere REPARTIDOR)

```http
POST http://localhost:3009/api/pedidos/:id/confirmar
Authorization: Bearer {{token_repartidor}}
```

### Ejemplo: Asignación Manual (requiere SUPERVISOR)

```http
POST http://localhost:3009/api/flota/asignaciones
Authorization: Bearer {{token_supervisor}
Content-Type: application/json

{
  "pedidoId": "...",
  "repartidorId": "..."
}
```

---

## 📊 Tabla de Roles por Endpoint

### Pedidos
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/pedidos` | POST | `CLIENTE` |
| `/api/pedidos/:id` | GET | `CLIENTE`, `REPARTIDOR`, `SUPERVISOR`, `GERENTE` |
| `/api/pedidos/:id/cancelar` | PATCH | `CLIENTE`, `GERENTE`, `ADMIN` |
| `/api/pedidos/:id/estado` | PATCH | `REPARTIDOR` |
| `/api/pedidos/:id/confirmar` | POST | `REPARTIDOR` |

### Flota - Repartidores
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/flota/repartidores` | POST | `GERENTE`, `ADMIN` |
| `/api/flota/repartidores` | GET | `GERENTE`, `ADMIN`, `SUPERVISOR` |
| `/api/flota/repartidores/:id` | GET | `SUPERVISOR`, `GERENTE`, `ADMIN` |
| `/api/flota/repartidores/:id` | PATCH | `GERENTE`, `ADMIN` |
| `/api/flota/repartidores/:id` | DELETE | `GERENTE`, `ADMIN` |
| `/api/flota/repartidores/:id/estado` | PATCH | `REPARTIDOR` |

### Flota - Vehículos
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/flota/vehiculos` | POST | `GERENTE`, `ADMIN` |
| `/api/flota/vehiculos` | GET | `GERENTE`, `ADMIN` |
| `/api/flota/vehiculos/:id` | GET | `SUPERVISOR` |
| `/api/flota/vehiculos/:id` | PATCH | `GERENTE`, `ADMIN` |
| `/api/flota/vehiculos/:id` | DELETE | `GERENTE`, `ADMIN` |

### Flota - Zonas
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/flota/zonas` | POST | `GERENTE`, `ADMIN` |
| `/api/flota/zonas` | GET | `GERENTE`, `ADMIN`, `SUPERVISOR` |
| `/api/flota/zonas/:id` | GET | `GERENTE`, `ADMIN` |
| `/api/flota/zonas/:id` | PATCH | `GERENTE`, `ADMIN` |
| `/api/flota/zonas/:id` | DELETE | `GERENTE`, `ADMIN` |

### Flota - Asignaciones
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/flota/asignaciones` | POST | `SUPERVISOR` |
| `/api/flota/asignaciones/:id/iniciar` | POST | `REPARTIDOR` |
| `/api/flota/asignaciones/finalizar` | POST | `REPARTIDOR` |

### Flota - Disponibilidad
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/flota/disponibilidad/zona/:zonaId` | GET | `SUPERVISOR` |

### Inventory
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/inventory/products` | POST | `GERENTE`, `ADMIN` |
| `/api/inventory/products` | GET | `GERENTE`, `ADMIN` |
| `/api/inventory/products/:id` | PATCH | `GERENTE`, `ADMIN` |
| `/api/inventory/products/:id` | DELETE | `GERENTE`, `ADMIN` |
| `/api/inventory/products/:id/stock/add` | POST | `GERENTE`, `ADMIN` |
| `/api/inventory/reservations` | POST | `ADMIN`, `SISTEMA` |
| `/api/inventory/reservations/:id/confirm` | POST | `ADMIN`, `SISTEMA` |
| `/api/inventory/reservations/:id/cancel` | POST | `ADMIN`, `SISTEMA` |

### Billing
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/billing/calculate-tariff` | POST | `CLIENTE` |
| `/api/billing/invoices` | GET | `GERENTE`, `ADMIN` |
| `/api/billing/invoices/:id` | GET | `GERENTE`, `ADMIN` |
| `/api/billing/invoices/order/:pedidoId` | GET | `GERENTE`, `ADMIN` |
| `/api/billing/invoices/:id/payment` | POST | `CLIENTE` |
| `/api/billing/invoices/:id/cancel` | PATCH | `GERENTE`, `ADMIN` |
| `/api/billing/invoices/:id/emit` | POST | `ADMIN`, `SISTEMA` |
| `/api/billing/daily-report` | GET | `GERENTE`, `ADMIN` |
| `/api/billing/metrics/summary` | GET | `SUPERVISOR`, `GERENTE`, `ADMIN` |

### Tracking
| Endpoint | Método | Roles Permitidos |
|----------|--------|------------------|
| `/api/tracking/position` | POST | `REPARTIDOR` |
| `/api/tracking/order/:pedidoId` | GET | `CLIENTE`, `SUPERVISOR`, `GERENTE`, `ADMIN` |
| `/api/tracking/repartidor/:repartidorId/history` | GET | `SUPERVISOR`, `GERENTE`, `ADMIN` |
| `/api/tracking/zone/:zonaId` | GET | `SUPERVISOR`, `GERENTE`, `ADMIN` |
| `/api/tracking/repartidor/:repartidorId/current` | GET | `REPARTIDOR` |
| `/api/tracking/repartidor/:repartidorId/route/:routeId/start` | POST | `REPARTIDOR` |
| `/api/tracking/repartidor/:repartidorId/route/:routeId/complete` | POST | `REPARTIDOR` |
| `/api/tracking/analytics/distance` | GET | `REPARTIDOR`, `SUPERVISOR`, `GERENTE`, `ADMIN` |

### GraphQL
| Query/Mutation | Roles Permitidos |
|----------------|------------------|
| `dashboardSupervisor` | `SUPERVISOR`, `GERENTE`, `ADMIN` |
| `pedidosActivos` | `SUPERVISOR`, `GERENTE`, `ADMIN` |
| `pedidosPorEstado` | `CLIENTE`, `REPARTIDOR`, `SUPERVISOR`, `GERENTE`, `ADMIN` |
| `kpiDiarios` | `SUPERVISOR`, `GERENTE`, `ADMIN` |

---

## 🎯 Flujo de Testing Actualizado

### Fase 1: Setup Inicial
```bash
# 1. Limpiar bases de datos
pnpm db:clear

# 2. Ejecutar seeds
node scripts/seed-fleet.mjs
node scripts/seed-inventory.mjs
```

### Fase 2: Crear Usuarios (Postman)
1. ✅ Crear usuario CLIENTE → Guardar `token_cliente`
2. ✅ Crear usuario REPARTIDOR → Guardar `token_repartidor`
3. ✅ Crear usuario SUPERVISOR → Guardar `token_supervisor`
4. ✅ Crear usuario GERENTE → Guardar `token_gerente`
5. ✅ Crear usuario ADMIN → Guardar `token_admin`

### Fase 3: Testing de Pedidos
1. **Con token_cliente:** Crear pedido → Guardar `pedido_id`
2. **Con token_repartidor:** Consultar pedido asignado
3. **Con token_repartidor:** Confirmar pedido
4. **Con token_cliente:** Cancelar pedido (si está pendiente)

### Fase 4: Testing de Flota
1. **Con token_gerente:** Crear repartidor → Guardar `repartidor_id`
2. **Con token_supervisor:** Consultar disponibilidad
3. **Con token_supervisor:** Asignar pedido manualmente

### Fase 5: Testing GraphQL
1. **Con token_supervisor:** Query `dashboardSupervisor`
2. **Con token_gerente:** Query `kpiDiarios`
3. **Con token_cliente:** Query `pedidosPorEstado`

---

## 🚨 Errores Comunes

### Error 403: Forbidden
```json
{
  "statusCode": 403,
  "message": "No tienes permisos para acceder a este recurso",
  "error": "Forbidden"
}
```

**Solución:** Estás usando el token incorrecto. Verifica la tabla de roles arriba.

### Error 401: Unauthorized
```json
{
  "statusCode": 401,
  "message": "No autorizado",
  "error": "Unauthorized"
}
```

**Solución:** 
1. Token expiró → Hacer login nuevamente
2. Header incorrecto → Debe ser `Authorization: Bearer {{token}}`
3. Token no guardado → Verifica los scripts de Tests en Postman

---

## 💡 Tips para Postman

### 1. Variables de Entorno
Crea estas variables en tu Environment:
- `token_cliente`
- `token_repartidor`
- `token_supervisor`
- `token_gerente`
- `token_admin`
- `pedido_id`
- `repartidor_id`
- `zona_id`

### 2. Script de Pre-request Global
Puedes cambiar de usuario dinámicamente:

```javascript
// En Authorization tab, selecciona variable
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('token_cliente')
});
```

### 3. Colección con Folders por Rol
Organiza tus requests así:
```
📁 LogiFlow API
  📁 00 - Auth (crear usuarios)
  📁 01 - Cliente (con token_cliente)
  📁 02 - Repartidor (con token_repartidor)
  📁 03 - Supervisor (con token_supervisor)
  📁 04 - Gerente (con token_gerente)
  📁 05 - Admin (con token_admin)
```

---

## ✅ Checklist de Verificación

- [ ] Los 5 usuarios están creados y sus tokens guardados
- [ ] Puedo crear un pedido con `token_cliente`
- [ ] Puedo consultar pedidos con `token_repartidor`
- [ ] Recibo 403 si uso rol incorrecto
- [ ] GraphQL funciona con `token_supervisor`
- [ ] Puedo crear repartidores con `token_gerente`

---

## 📝 Notas Adicionales

1. **Múltiples Roles:** Algunos endpoints aceptan múltiples roles. Por ejemplo, `GET /api/pedidos/:id` acepta CLIENTE, REPARTIDOR, SUPERVISOR y GERENTE.

2. **Rol SISTEMA:** Es un rol interno para comunicación entre microservicios. No deberías crear usuarios con este rol manualmente.

3. **Orden de Testing:** Sigue el orden lógico: primero GERENTE crea recursos (repartidores, zonas), luego CLIENTE crea pedidos, después SUPERVISOR asigna, finalmente REPARTIDOR entrega.

4. **Compatibilidad con GUIA_TESTING_COMPLETA.md:** Esta guía **complementa** la anterior. Los endpoints y flujos siguen siendo los mismos, solo agregamos control de acceso por roles.
