# Queries GraphQL para Apollo Server Playground

## 🚀 Acceso al Playground

**URL:** http://localhost:3009/graphql

**Headers (en la esquina inferior izquierda):**
```json
{
  "Authorization": "Bearer TU_JWT_TOKEN_AQUI"
}
```

---

## 📋 Queries Principales

### 1. Dashboard de Supervisor (Consulta Completa)

Esta query muestra todo lo que un supervisor necesita ver en tiempo real.

```graphql
query DashboardSupervisor($zonaId: ID!) {
  # Lista de pedidos activos en la zona
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
      referencia
    }
    repartidor {
      id
      nombre
      telefono
      vehiculo {
        tipo
        placa
        modelo
        anio
      }
    }
    tiempoTranscurrido
    retrasoEstimadoMin
  }
  
  # Estado de la flota en la zona
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

**Variables:**
```json
{
  "zonaId": "ZONA-001"
}
```

**Resultado Esperado:**
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
          "lng": -78.467838,
          "referencia": "Edificio azul"
        },
        "repartidor": {
          "id": "REP-001",
          "nombre": "Carlos Conductor",
          "telefono": "+593987654322",
          "vehiculo": {
            "tipo": "motorizado",
            "placa": "ABC-123",
            "modelo": "Honda Wave 110",
            "anio": 2022
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

---

### 2. Repartidores Disponibles (con DataLoader)

Esta query demuestra la prevención de N+1 con DataLoader.

```graphql
query RepartidoresDisponibles($zonaId: ID) {
  repartidores(filtro: { estado: DISPONIBLE, zonaId: $zonaId }) {
    id
    nombre
    telefono
    estado
    zona {
      id
      nombre
      cobertura
      activa
    }
    vehiculo {
      id
      tipo
      placa
      marca
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

**Variables:**
```json
{
  "zonaId": "ZONA-001"
}
```

**Verificar DataLoader:**
- ✅ Revisar logs del servidor
- ✅ Debe haber solo 1 llamada al Fleet Service para obtener todos los vehículos
- ✅ Debe haber solo 1 llamada para obtener todas las zonas
- ✅ Sin DataLoader habría N llamadas (1 por cada repartidor)

---

### 3. Pedidos con Filtros Complejos

```graphql
query PedidosFiltrados(
  $zonaId: ID
  $estado: EstadoPedido
  $desde: DateTime
  $hasta: DateTime
) {
  pedidos(
    filtro: {
      zonaId: $zonaId
      estado: $estado
      fechaDesde: $desde
      fechaHasta: $hasta
    }
  ) {
    id
    estado
    createdAt
    updatedAt
    tipoEntrega
    destino {
      direccion
      lat
      lng
    }
    repartidor {
      nombre
      vehiculo {
        tipo
        placa
      }
    }
    factura {
      total
      estado
    }
  }
}
```

**Variables:**
```json
{
  "zonaId": "ZONA-001",
  "estado": "ENTREGADO",
  "desde": "2026-02-05T00:00:00Z",
  "hasta": "2026-02-05T23:59:59Z"
}
```

---

### 4. Flota Activa por Zona

```graphql
query FlotaPorZona($zonaId: ID!) {
  flotaActiva(zonaId: $zonaId) {
    total
    disponibles
    enRuta
    enMantenimiento
  }
  
  repartidores(filtro: { zonaId: $zonaId }) {
    id
    nombre
    estado
    vehiculo {
      tipo
      placa
    }
    pedidoActual {
      id
      estado
      destino {
        direccion
      }
    }
  }
}
```

**Variables:**
```json
{
  "zonaId": "ZONA-001"
}
```

---

### 5. KPIs Diarios Comparativos

```graphql
query KPIComparativo {
  hoy: kpiDiario(fecha: "2026-02-05", zonaId: "ZONA-001") {
    fecha
    totalPedidos
    pedidosEntregados
    pedidosCancelados
    tasaExito
    ingresoTotal
    tiempoPromedioEntrega
  }
  
  ayer: kpiDiario(fecha: "2026-02-04", zonaId: "ZONA-001") {
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

**Sin variables necesarias**

**Análisis del resultado:**
```javascript
// En la consola del navegador:
const hoy = data.hoy;
const ayer = data.ayer;

console.log(`
Comparación Diaria:
- Pedidos: ${hoy.totalPedidos} vs ${ayer.totalPedidos} (${hoy.totalPedidos - ayer.totalPedidos > 0 ? '+' : ''}${hoy.totalPedidos - ayer.totalPedidos})
- Tasa de éxito: ${hoy.tasaExito}% vs ${ayer.tasaExito}%
- Ingresos: $${hoy.ingresoTotal} vs $${ayer.ingresoTotal}
`);
```

---

### 6. Vehículos por Tipo

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
    capacidadM3
    estado
    kmRecorridos
    ultimoMantenimiento
    repartidorActual {
      id
      nombre
      telefono
    }
  }
}
```

**Variables (probar con cada tipo):**
```json
{
  "tipo": "motorizado"
}
```

```json
{
  "tipo": "camioneta"
}
```

```json
{
  "tipo": "camion"
}
```

---

### 7. Zonas de Cobertura

```graphql
query ZonasCobertura {
  zonas {
    id
    nombre
    cobertura
    activa
    repartidoresActivos
    repartidores {
      id
      nombre
      estado
      vehiculo {
        tipo
        placa
      }
    }
  }
}
```

---

### 8. Detalle de Pedido Único

```graphql
query DetallePedido($pedidoId: ID!) {
  pedido(id: $pedidoId) {
    id
    estado
    createdAt
    updatedAt
    tipoEntrega
    cliente {
      nombre
      email
      telefono
    }
    items {
      productoId
      cantidad
      precio
      subtotal
    }
    destino {
      direccion
      lat
      lng
      referencia
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
    factura {
      id
      numero
      estado
      subtotal
      iva
      total
      emitidaEn
    }
    tracking {
      ultimaUbicacion {
        lat
        lng
      }
      ultimaActualizacion
    }
    tiempoTranscurrido
    retrasoEstimadoMin
  }
}
```

**Variables:**
```json
{
  "pedidoId": "PED-20260205-001"
}
```

---

## 🧪 Pruebas de Performance (DataLoader)

### Prueba N+1 Problem Resolution

**Query con muchos pedidos:**
```graphql
query TestDataLoader {
  pedidos(filtro: { estado: ENTREGADO }) {
    id
    repartidor {
      id
      nombre
      vehiculo {
        id
        tipo
        placa
      }
      zona {
        id
        nombre
      }
    }
  }
}
```

**Verificar en logs del servidor:**

❌ **Sin DataLoader (N+1 problem):**
```
[Fleet Service] GET /repartidores/REP-001    # 1 llamada por pedido
[Fleet Service] GET /repartidores/REP-002    # ❌ Ineficiente
[Fleet Service] GET /repartidores/REP-003
... (N llamadas)
```

✅ **Con DataLoader (batch loading):**
```
[Fleet Service] GET /repartidores/batch      # Solo 1 llamada
[RepartidorLoader] Batch loading 25 repartidores
```

---

## 🔍 Introspection Queries

### Ver el Schema Completo

```graphql
query IntrospectionQuery {
  __schema {
    types {
      name
      kind
      description
    }
  }
}
```

### Ver Tipos de un Objeto

```graphql
query TiposPedido {
  __type(name: "PedidoType") {
    name
    fields {
      name
      type {
        name
        kind
      }
      description
    }
  }
}
```

### Ver Queries Disponibles

```graphql
query QueriesDisponibles {
  __schema {
    queryType {
      fields {
        name
        description
        args {
          name
          type {
            name
          }
        }
      }
    }
  }
}
```

---

## 📊 Queries para Dashboard de Gerente

### Reporte Ejecutivo

```graphql
query ReporteEjecutivo($fecha: String!) {
  # KPIs por todas las zonas
  zonas {
    id
    nombre
    kpis: kpiDiario(fecha: $fecha) {
      totalPedidos
      pedidosEntregados
      tasaExito
      ingresoTotal
      tiempoPromedioEntrega
    }
  }
  
  # Resumen global
  kpiGlobal: kpiDiario(fecha: $fecha) {
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

**Variables:**
```json
{
  "fecha": "2026-02-05"
}
```

---

## ⚠️ Queries de Error Handling

### Pedido No Existe

```graphql
query PedidoInexistente {
  pedido(id: "PED-NOEXISTE") {
    id
    estado
  }
}
```

**Resultado esperado:**
```json
{
  "data": {
    "pedido": null
  },
  "errors": [
    {
      "message": "Pedido no encontrado",
      "path": ["pedido"],
      "extensions": {
        "code": "NOT_FOUND"
      }
    }
  ]
}
```

### Sin Autenticación

Eliminar el header `Authorization` y ejecutar cualquier query.

**Resultado esperado:**
```json
{
  "errors": [
    {
      "message": "Unauthorized",
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

---

## 🎯 Checklist de Verificación GraphQL

### Funcionalidad Básica
- [ ] **Query `pedidos`**: Lista pedidos con filtros
- [ ] **Query `pedido(id)`**: Obtiene pedido específico
- [ ] **Query `repartidores`**: Lista repartidores con filtros
- [ ] **Query `vehiculos`**: Lista vehículos con filtros
- [ ] **Query `zonas`**: Lista zonas de cobertura
- [ ] **Query `flotaActiva`**: Resumen de flota por zona
- [ ] **Query `kpiDiario`**: KPIs diarios con filtros

### Performance (DataLoader)
- [ ] **N+1 Prevention**: Verificar logs del servidor
- [ ] **Batch Loading**: Solo 1 llamada al microservicio por tipo de relación
- [ ] **Caching**: DataLoader cachea dentro del mismo request

### Campos Relacionados
- [ ] `pedido.repartidor`: Resuelve correctamente con DataLoader
- [ ] `repartidor.vehiculo`: Resuelve con VehiculoLoader
- [ ] `repartidor.zona`: Resuelve con ZonaLoader
- [ ] `pedido.factura`: Resuelve desde Billing Service

### Error Handling
- [ ] Query sin autenticación → Error 401/Unauthorized
- [ ] Query de recurso inexistente → Null con error descriptivo
- [ ] Query con filtros inválidos → Error de validación
- [ ] Error de microservicio → Propagado correctamente

### Tipos GraphQL
- [ ] Enum `EstadoPedido`: PENDIENTE, ASIGNADO, EN_RUTA, ENTREGADO, CANCELADO
- [ ] Enum `TipoVehiculo`: motorizado, camioneta, camion
- [ ] Enum `EstadoRepartidor`: DISPONIBLE, EN_RUTA, OFFLINE, MANTENIMIENTO
- [ ] Input `PedidoFiltro`: Acepta múltiples criterios de búsqueda

---

## 💡 Tips para Apollo Playground

1. **Auto-complete**: Presiona `Ctrl + Space` para ver sugerencias
2. **Docs**: Click en "Docs" (lado derecho) para ver el schema completo
3. **History**: Click en "History" para ver queries anteriores
4. **Format**: `Ctrl + Shift + F` para formatear la query
5. **Execute**: `Ctrl + Enter` para ejecutar la query
6. **Multiple queries**: Nombra las queries para elegir cuál ejecutar

**Ejemplo múltiples queries:**
```graphql
query Pedidos {
  pedidos { id estado }
}

query Repartidores {
  repartidores { id nombre }
}
```

---

## 📝 Notas Finales

- Todas las queries requieren autenticación (excepto introspection)
- El GraphQL server está en modo `playground: true` (solo para desarrollo)
- Para producción, desactivar playground y usar GraphiQL o Apollo Studio
- Los DataLoaders tienen scope `REQUEST`, se recrean en cada petición
- Las queries GraphQL NO deben usarse para mutaciones críticas (usar REST)

---

**Última actualización:** 5 de febrero de 2026
