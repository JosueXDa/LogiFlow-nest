# Fleet Service (Servicio de Flota)

Microservicio encargado de la gestión de conductores, vehículos y la lógica de asignación inteligente de pedidos.

## Características Principales

### 1. Arquitectura Orientada a Objetos (POO)

- **Herencia de Clases**: Implementa `Single Table Inheritance` con TypeORM
  - Clase abstracta `Vehiculo` como base
  - Subclases: `Motorizado`, `VehiculoLiviano`, `Camion`
- **Interfaces**:
  - `IAptitud`: Define métodos para validar capacidad de carga
  - `IRuteable`: Define métodos para cálculo de distancias

### 2. Lógica de Asignación Inteligente

El algoritmo de asignación (`asignarConductorAPedido`) implementa:

1. **Búsqueda espacial**: Encuentra conductores disponibles cerca del origen
2. **Filtro por tipo**: Selecciona vehículos del tipo requerido o superior
3. **Validación de capacidad**: Usa el método `esAptoPara()` (polimorfismo)
4. **Ordenamiento por distancia**: Formula de Haversine para cálculo preciso
5. **Radio de búsqueda**: Configurable (por defecto 5km)
6. **Transacción ACID**: Evita race conditions en asignaciones concurrentes

### 3. Comunicación Híbrida

- **TCP (puerto 4005)**: Para comunicación síncrona con API Gateway
  - `registrar_conductor`
  - `listar_conductores`
  - `obtener_conductor`
  - `actualizar_estado_conductor`
  - `actualizar_ubicacion_conductor`

- **RabbitMQ (eventos)**: Para comunicación asíncrona
  - **Escucha**: `pedido.creado`, `pedido.entregado`, `pedido.cancelado`
  - **Emite**: `conductor.asignado`, `asignacion.fallida`, `conductor.liberado`

## Estructura del Proyecto

```
src/
├── flota/
│   ├── entities/
│   │   ├── conductor.entity.ts      # Entidad Conductor
│   │   ├── vehiculo.entity.ts       # Clase abstracta Vehiculo
│   │   ├── motorizado.entity.ts     # Subclase Motorizado
│   │   ├── vehiculo-liviano.entity.ts
│   │   └── camion.entity.ts
│   ├── interfaces/
│   │   ├── aptitud.interface.ts     # IAptitud
│   │   └── ruteable.interface.ts    # IRuteable
│   ├── dto/
│   │   ├── create-conductor.dto.ts
│   │   ├── create-vehiculo.dto.ts
│   │   ├── update-conductor-status.dto.ts
│   │   └── update-ubicacion.dto.ts
│   ├── flota.controller.ts          # MessagePattern (TCP)
│   ├── flota-events.controller.ts   # EventPattern (RabbitMQ)
│   ├── flota.service.ts             # Lógica de negocio
│   ├── flota.module.ts
│   └── flota.constants.ts
├── common/
│   └── filters/
│       └── rpc-exception.filter.ts
├── config/
│   └── typeorm.config.ts
├── app.module.ts
└── main.ts
```

## Entidades y Relaciones

### Conductor

- `id`: UUID
- `usuarioId`: UUID (referencia a auth-service)
- `nombre`: String
- `estado`: Enum (DISPONIBLE, OCUPADO, FUERA_DE_SERVICIO)
- `latitud`, `longitud`: Decimal (ubicación GPS)
- `zonaOperacionId`: String
- `vehiculo`: OneToOne con Vehiculo

### Vehiculo (Abstracta)

- `id`: UUID
- `placa`: String (unique)
- `modelo`: String
- `tipo`: Enum (discriminador)
- `capacidadKg`: Decimal

#### Motorizado (Hijo)

- Capacidad máxima: 30kg
- Campo adicional: `cilindraje`

#### VehiculoLiviano (Hijo)

- Capacidad máxima: 500kg
- Campos adicionales: `numeroPuertas`, `tipoCarroceria`

#### Camion (Hijo)

- Sin límite superior definido
- Campos adicionales: `numeroEjes`, `volumenM3`

## Configuración

### Variables de Entorno

Copiar `.env.example` a `.env` y configurar:

```bash
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=fleet_db
DB_USERNAME=postgres
DB_PASSWORD=postgres

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_PEDIDOS_QUEUE=pedidos_events
RABBITMQ_FLOTA_QUEUE=flota_events

# TCP
TCP_PORT=4005
```

### Instalación

Desde la raíz del monorepo:

```bash
# Instalar dependencias del workspace
pnpm --filter fleet-service install
```

### Desarrollo

```bash
# Desde la raíz del monorepo
pnpm --filter fleet-service start:dev

# O usando turbo
turbo run start:dev --filter=fleet-service
```

## Endpoints (MessagePattern)

### Registrar Conductor

```typescript
pattern: 'registrar_conductor';
payload: CreateConductorDto;
```

### Listar Conductores

```typescript
pattern: 'listar_conductores'
payload: { zonaId?: string, estado?: EstadoConductor }
```

### Obtener Conductor

```typescript
pattern: 'obtener_conductor';
payload: string(id);
```

### Actualizar Estado

```typescript
pattern: 'actualizar_estado_conductor'
payload: { id: string, dto: UpdateConductorStatusDto }
```

### Actualizar Ubicación

```typescript
pattern: 'actualizar_ubicacion_conductor'
payload: { id: string, dto: UpdateUbicacionDto }
```

## Eventos (EventPattern)

### Consumidos

**pedido.creado**

```typescript
{
  id: string;
  origen: { latitud: number; longitud: number };
  tipoVehiculo: TipoVehiculo;
  pesoKg?: number;
}
```

**pedido.entregado / pedido.cancelado**

```typescript
{
  pedidoId: string;
  conductorId: string;
}
```

### Emitidos

**conductor.asignado**

```typescript
{
  pedidoId: string;
  conductorId: string;
  nombreConductor: string;
  placaVehiculo: string;
  coordenadasIniciales: {
    lat: number;
    lng: number;
  }
  tiempoEstimadoLlegada: number; // minutos
}
```

**asignacion.fallida**

```typescript
{
  pedidoId: string;
  razon: string;
}
```

**conductor.liberado**

```typescript
{
  conductorId: string;
}
```

## Algoritmo de Asignación

1. Consulta conductores con estado `DISPONIBLE` y tipo de vehículo compatible
2. Filtra por capacidad usando `vehiculo.esAptoPara(pesoKg)`
3. Calcula distancia a cada conductor (fórmula de Haversine)
4. Ordena por distancia ascendente
5. Filtra por radio de búsqueda (5km por defecto)
6. Selecciona el conductor más cercano
7. Bloquea al conductor (estado = `OCUPADO`) en transacción
8. Emite evento `conductor.asignado` con tiempo estimado

## Transaccionalidad

El método `asignarConductorAPedido` usa `DataSource.transaction()` para garantizar:

- Atomicidad en la asignación
- Prevención de race conditions
- Consistencia de datos

## Próximas Mejoras

- [ ] Integrar PostGIS para consultas espaciales nativas
- [ ] Implementar sistema de puntuación de conductores
- [ ] Agregar predicción de disponibilidad con ML
- [ ] Implementar reconexión automática de RabbitMQ
- [ ] Agregar métricas y monitoring (Prometheus)
- [ ] Implementar caché de ubicaciones (Redis)

## Testing

```bash
# Unit tests
pnpm --filter fleet-service test

# E2E tests
pnpm --filter fleet-service test:e2e

# Coverage
pnpm --filter fleet-service test:cov
```

## Arquitectura de Referencia

Este servicio sigue el patrón establecido por `pedidos-service`:

- Separación de concerns (Controller, Service, Repository)
- DTOs con validación (class-validator)
- Comunicación híbrida (TCP + RabbitMQ)
- Manejo de excepciones globalizado
- TypeORM con herencia de entidades
