# Inventory Service

Microservicio de gestión de inventario para LogiFlow. Maneja productos, stock y reservas mediante el patrón Saga.

## Arquitectura

- **Transporte**: TCP (puerto 4006)
- **Base de datos**: PostgreSQL (puerto 5435)
- **Comunicación**: Message Patterns con API Gateway
- **Eventos**: Preparado para RabbitMQ (implementación futura)

## Entidades

### Producto

- SKU único
- Nombre, descripción, precio
- Peso en kg (para determinar tipo de vehículo)
- Stock total y reservado
- Getter `stockDisponible` (stockTotal - stockReservado)

### ReservaStock

- Estados: PENDIENTE, CONFIRMADA, CANCELADA
- Vinculada a pedido y producto
- Expiración configurable (30 minutos por defecto)
- Patrón Saga para transacciones distribuidas

## Endpoints API Gateway

### Productos (CRUD)

```
POST   /inventory/products              - Crear producto
GET    /inventory/products              - Listar productos
GET    /inventory/products/:id          - Obtener producto por ID
GET    /inventory/products/sku/:sku     - Obtener producto por SKU
PATCH  /inventory/products/:id          - Actualizar producto
DELETE /inventory/products/:id          - Eliminar producto
```

### Gestión de Stock

```
PATCH  /inventory/products/:id/stock    - Actualizar stock total
POST   /inventory/products/:id/stock/add - Añadir stock
GET    /inventory/products/:id/stock    - Consultar stock disponible
```

### Reservas (Saga Pattern)

```
POST   /inventory/reserves              - Reservar stock
PATCH  /inventory/reserves/:id/confirm  - Confirmar reserva
PATCH  /inventory/reserves/:id/cancel   - Cancelar reserva
GET    /inventory/reserves/pedido/:pedidoId - Obtener reservas por pedido
```

## Message Patterns

El microservicio escucha los siguientes patrones:

- `create_product`
- `get_all_products`
- `get_product`
- `get_product_by_sku`
- `update_product`
- `delete_product`
- `update_stock`
- `add_stock`
- `check_stock`
- `reserve_stock`
- `confirm_reserve`
- `cancel_reserve`
- `get_reserves_by_pedido`

## Configuración

### Variables de Entorno

Copia `.env.example` a `.env` y configura:

```env
DB_HOST=localhost
DB_PORT=5435
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=inventory_db
DB_SYNC=true
DB_LOGGING=false
```

### Base de Datos

La base de datos se levanta automáticamente con Docker Compose:

```bash
docker-compose up -d postgres-inventory
```

## Desarrollo

```bash
# Instalar dependencias (desde la raíz del monorepo)
pnpm install

# Modo desarrollo
pnpm --filter inventory-service start:dev

# Build
pnpm --filter inventory-service build

# Producción
pnpm --filter inventory-service start:prod
```

## RabbitMQ (Preparado para Uso Futuro)

El servicio está preparado para eventos con RabbitMQ. Para activarlo:

1. Añade RabbitMQ al `docker-compose.yml`
2. Descomenta la configuración en `inventory.module.ts`
3. Activa los event handlers en `inventory-events.controller.ts`
4. Configura hybrid microservice en `main.ts`:

```typescript
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AppModule,
  {
    transport: Transport.TCP,
    options: { port: 4006 },
  },
);

app.connectMicroservice<MicroserviceOptions>({
  transport: Transport.RMQ,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: 'inventory_events',
    queueOptions: { durable: true },
  },
});

await app.startAllMicroservices();
```

## Eventos Disponibles (Futuros)

- `pedido.creado` → Reserva stock automáticamente
- `pedido.cancelado` → Libera reservas
- `pedido.entregado` → Confirma reservas y descuenta stock

## Flujo Saga Pattern

### Reservar Stock

1. Cliente solicita crear pedido
2. Inventory reserva stock (Estado: PENDIENTE)
3. Stock reservado se incrementa
4. Stock disponible se reduce

### Confirmar Reserva

1. Pedido es entregado exitosamente
2. Inventory confirma reserva (Estado: CONFIRMADA)
3. Stock total se reduce
4. Stock reservado se reduce

### Cancelar Reserva

1. Pedido falla o se cancela
2. Inventory cancela reserva (Estado: CANCELADA)
3. Stock reservado se reduce
4. Stock disponible se restaura

## Guards

Todos los endpoints del API Gateway están protegidos con `AuthGuard` que valida la sesión de usuario.

## Validación

Se utiliza `class-validator` en todos los DTOs:

- CreateProductDto
- UpdateProductDto
- ReserveStockDto
- UpdateStockDto

## Arquitectura Implementada

Siguiendo el patrón establecido en `pedidos-service`:

- ✅ Microservicio TCP
- ✅ TypeORM con PostgreSQL
- ✅ DTOs con validación
- ✅ Message Patterns
- ✅ Integración con API Gateway
- ✅ Guards de autenticación
- ✅ Preparado para eventos RabbitMQ
