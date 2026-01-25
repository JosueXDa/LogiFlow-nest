# Fleet Service - Arquitectura Implementada

## Resumen de Implementación

Se ha implementado completamente el **Fleet Service** siguiendo la arquitectura de microservicios establecida y los principios de diseño orientado a objetos solicitados.

## Estructura de Archivos Creados

```
apps/fleet-service/
├── src/
│   ├── flota/
│   │   ├── entities/
│   │   │   ├── vehiculo.entity.ts          ✅ Clase abstracta con IAptitud
│   │   │   ├── conductor.entity.ts         ✅ Entidad con cálculo de distancia
│   │   │   ├── motorizado.entity.ts        ✅ @ChildEntity (30kg max)
│   │   │   ├── vehiculo-liviano.entity.ts  ✅ @ChildEntity (500kg max)
│   │   │   ├── camion.entity.ts            ✅ @ChildEntity (sin límite)
│   │   │   └── index.ts
│   │   ├── interfaces/
│   │   │   ├── aptitud.interface.ts        ✅ IAptitud (POO)
│   │   │   └── ruteable.interface.ts       ✅ IRuteable (POO)
│   │   ├── dto/
│   │   │   ├── create-conductor.dto.ts     ✅ Con validación
│   │   │   ├── create-vehiculo.dto.ts      ✅ Con validación
│   │   │   ├── update-conductor-status.dto.ts
│   │   │   ├── update-ubicacion.dto.ts
│   │   │   └── index.ts
│   │   ├── flota.controller.ts             ✅ MessagePattern (TCP)
│   │   ├── flota-events.controller.ts      ✅ EventPattern (RabbitMQ)
│   │   ├── flota.service.ts                ✅ Lógica de asignación inteligente
│   │   ├── flota.module.ts                 ✅ Módulo configurado
│   │   └── flota.constants.ts              ✅ Constantes del dominio
│   ├── common/
│   │   └── filters/
│   │       └── rpc-exception.filter.ts     ✅ Filtro de excepciones
│   ├── config/
│   │   └── typeorm.config.ts               ✅ Configuración TypeORM
│   ├── app.module.ts                       ✅ Módulo principal
│   └── main.ts                             ✅ Bootstrap con TCP
├── .env.example                            ✅ Variables de entorno
└── README.md                               ✅ Documentación completa
```

## Principios de Diseño Implementados

### 1. Herencia de Clases (Single Table Inheritance)

```typescript
@Entity('vehiculos')
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
export abstract class Vehiculo implements IAptitud {
  // Campos comunes
  abstract esAptoPara(pesoKg: number): boolean;
}

@ChildEntity(TipoVehiculo.MOTORIZADO)
export class Motorizado extends Vehiculo {
  esAptoPara(pesoKg: number): boolean {
    return pesoKg <= 30 && pesoKg <= this.capacidadKg;
  }
}
```

### 2. Interfaces POO

**IAptitud**: Define la capacidad de un vehículo para transportar carga

```typescript
interface IAptitud {
  esAptoPara(pesoKg: number): boolean;
  calcularPorcentajeCapacidad(pesoKg: number): number;
}
```

**IRuteable**: Define la capacidad de ruteo (documentado para futuras mejoras)

### 3. Lógica de Asignación Inteligente

El método `asignarConductorAPedido` implementa:

1. **Consulta espacial**: Busca conductores disponibles
2. **Filtro por tipo**: Selecciona vehículo compatible
3. **Validación OOP**: Usa `vehiculo.esAptoPara(pesoKg)` (polimorfismo)
4. **Ordenamiento**: Fórmula de Haversine para distancia
5. **Transacción ACID**: Previene race conditions
6. **Emisión de eventos**: Comunica resultado a otros servicios

```typescript
// Filtrar por capacidad usando POO
const conductoresAptos = conductoresDisponibles.filter((conductor) =>
  conductor.vehiculo.esAptoPara(pesoKg),
);

// Calcular distancias
const conductoresConDistancia = conductoresAptos.map((conductor) => ({
  conductor,
  distancia: conductor.calcularDistancia(origen.latitud, origen.longitud),
}));
```

## Comunicación entre Microservicios

### TCP (Puerto 4005) - Comunicación Síncrona con API Gateway

```typescript
@MessagePattern('registrar_conductor')
@MessagePattern('listar_conductores')
@MessagePattern('obtener_conductor')
@MessagePattern('actualizar_estado_conductor')
@MessagePattern('actualizar_ubicacion_conductor')
```

### RabbitMQ - Comunicación Asíncrona con Pedidos Service

**Eventos Consumidos:**

- `pedido.creado` → Asigna conductor automáticamente
- `pedido.entregado` → Libera conductor
- `pedido.cancelado` → Libera conductor

**Eventos Emitidos:**

- `conductor.asignado` → Notifica a pedidos-service
- `asignacion.fallida` → Notifica falta de conductores
- `conductor.liberado` → Notifica disponibilidad

## Validaciones y Seguridad

1. **Validación de DTOs**: Usando `class-validator`
   - `@IsUUID()`, `@IsString()`, `@IsEnum()`
   - `@Min()`, `@Max()` para coordenadas GPS
   - `@ValidateNested()` para objetos anidados

2. **Autenticación**: Manejada por el API Gateway
   - El API Gateway valida tokens JWT
   - Las peticiones al fleet-service ya están autenticadas
   - No se requiere guard adicional en el microservicio

3. **Filtro de Excepciones**: Convierte errores a formato RPC

4. **ValidationPipe Global**: Transforma y valida payloads

## Casos de Uso Implementados

### Caso 1: Registrar Conductor

```
API Gateway → TCP (registrar_conductor) → Fleet Service
↓
Crea Conductor + Vehiculo (herencia)
↓
Emite: conductor.registrado (RabbitMQ)
```

### Caso 2: Asignación Automática

```
Pedido creado → RabbitMQ (pedido.creado) → Fleet Service
↓
Algoritmo de asignación inteligente (transacción)
↓
Emite: conductor.asignado → Pedidos Service actualiza
```

### Caso 3: Liberar Conductor

```
Pedido entregado → RabbitMQ (pedido.entregado) → Fleet Service
↓
Cambia estado: OCUPADO → DISPONIBLE
↓
Emite: conductor.liberado
```

## Configuración de Base de Datos

### TypeORM con Herencia

```typescript
entities: [
  Vehiculo, // Clase abstracta
  Conductor,
  Motorizado, // @ChildEntity
  VehiculoLiviano,
  Camion,
];
```

### Tabla Generada: `vehiculos`

| id   | placa | modelo | tipo       | capacidadKg | cilindraje | numeroPuertas | numeroEjes |
| ---- | ----- | ------ | ---------- | ----------- | ---------- | ------------- | ---------- |
| uuid | P-123 | Yamaha | MOTORIZADO | 25          | 150cc      | null          | null       |
| uuid | V-456 | Toyota | LIVIANO    | 400         | null       | 4             | null       |
| uuid | C-789 | Isuzu  | CAMION     | 5000        | null       | null          | 6          |

**Discriminador**: Columna `tipo` determina la subclase

## Variables de Entorno Requeridas

```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=fleet_db
DB_USERNAME=postgres
DB_PASSWORD=postgres
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_PEDIDOS_QUEUE=pedidos_events
RABBITMQ_FLOTA_QUEUE=flota_events
TCP_PORT=4005
```

## Próximos Pasos

1. **Integración con API Gateway**: Configurar cliente TCP
2. **Base de Datos**: Crear DB `fleet_db` en PostgreSQL
3. **RabbitMQ**: Asegurar que esté corriendo
4. **Testing**: Implementar tests unitarios y E2E
5. **PostGIS**: Upgrade a consultas espaciales nativas (opcional)

## Comandos para Ejecutar

```bash
# Instalar dependencias (desde raíz del monorepo)
pnpm --filter fleet-service install

# Iniciar en modo desarrollo
pnpm --filter fleet-service start:dev

# Build
pnpm --filter fleet-service build

# Tests
pnpm --filter fleet-service test
```

## Cumplimiento de Requisitos

✅ **Herencia de Clases**: `Vehiculo` abstracta con 3 subclases  
✅ **Interfaces POO**: `IAptitud` y `IRuteable` documentadas  
✅ **Transaccionalidad**: `DataSource.transaction()` en asignación  
✅ **Comunicación TCP**: MessagePattern para API Gateway  
✅ **Comunicación RabbitMQ**: EventPattern para eventos  
✅ **Autenticación**: Manejada por API Gateway (AuthGuard)
✅ **Validación**: DTOs con class-validator  
✅ **Arquitectura coherente**: Similar a pedidos-service  
✅ **Monorepo compatible**: pnpm workspace filters

## Arquitectura Visual

```
┌─────────────────┐
│   API Gateway   │ ◄── AuthGuard valida JWT
│   (Port 3000)   │
└────────┬────────┘
         │ TCP:4005 (sin auth)
         ▼
┌─────────────────────────┐
│    Fleet Service        │
│  ┌──────────────────┐   │
│  │ FlotaController  │   │ ◄── MessagePattern (TCP)
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │ FlotaEvents      │   │ ◄── EventPattern (RabbitMQ)
│  │ Controller       │   │
│  └──────────────────┘   │
│  ┌──────────────────┐   │
│  │  FlotaService    │   │ ◄── Lógica de negocio
│  │ (Asignación      │   │
│  │  Inteligente)    │   │
│  └──────────────────┘   │
│          │              │
│          ▼              │
│  ┌──────────────────┐   │
│  │  TypeORM Repos   │   │
│  └──────────────────┘   │
└───────────┬─────────────┘
            │
            ▼
    ┌──────────────┐
    │  PostgreSQL  │
    │  (fleet_db)  │
    └──────────────┘

    ┌──────────────┐
    │  RabbitMQ    │ ◄──► Pedidos Service
    └──────────────┘
```

---

**Implementado por**: OpenCode AI  
**Fecha**: 23 de Enero 2026  
**Arquitectura de referencia**: pedidos-service  
**Principios**: OOP, SOLID, Microservicios, Event-Driven
