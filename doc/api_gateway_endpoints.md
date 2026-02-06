# API Gateway Endpoints

This document lists all available endpoints in the API Gateway microservice, grouped by module/controller.

## App Module
**Base Path:** `/`

- `GET /` - Check API Gateway status

## Auth Module
**Base Path:** `/api/auth`

- `ALL /api/auth/*` - Proxy to Auth Service (Better Auth)

## Billing Module
**Base Path:** `/billing`

- `POST /billing/calculate-tariff` - Calculate tariff for an order
- `POST /billing/invoices` - Create invoice draft
- `GET /billing/invoices` - List invoices
- `GET /billing/invoices/:id` - Get invoice by ID
- `GET /billing/invoices/order/:pedidoId` - Get invoice by order ID
- `PATCH /billing/invoices/:id/emit` - Emit invoice
- `POST /billing/invoices/:id/payment` - Register payment
- `PATCH /billing/invoices/:id/cancel` - Cancel invoice
- `GET /billing/daily-report` - Get daily billing report

## Fleet (Flota) Module

### Asignacion Controller
**Base Path:** `/flota/asignaciones`

- `POST /flota/asignaciones` - Asignar repartidor
- `POST /flota/asignaciones/:id/iniciar` - Iniciar asignación
- `POST /flota/asignaciones/finalizar` - Finalizar asignación

### Disponibilidad Controller
**Base Path:** `/flota/disponibilidad`

- `GET /flota/disponibilidad/zona/:zonaId` - Consultar disponibilidad por zona

### Repartidor Controller
**Base Path:** `/flota/repartidores`

- `POST /flota/repartidores` - Create repartidor
- `GET /flota/repartidores` - List repartidores
- `GET /flota/repartidores/disponibles` - List available repartidores in a zone
- `GET /flota/repartidores/:id` - Get repartidor by ID
- `PATCH /flota/repartidores/:id` - Update repartidor
- `PATCH /flota/repartidores/:id/estado` - Change repartidor status
- `DELETE /flota/repartidores/:id` - Remove repartidor

### Vehiculo Controller
**Base Path:** `/flota/vehiculos`

- `POST /flota/vehiculos` - Create vehiculo
- `GET /flota/vehiculos` - List vehiculos
- `GET /flota/vehiculos/disponibles` - List available vehiculos by type
- `GET /flota/vehiculos/:id` - Get vehiculo by ID
- `PATCH /flota/vehiculos/:id` - Update vehiculo

### Zona Controller
**Base Path:** `/flota/zonas`

- `POST /flota/zonas` - Create zona
- `GET /flota/zonas` - List zonas
- `GET /flota/zonas/:id` - Get zona by ID
- `PATCH /flota/zonas/:id` - Update zona
- `DELETE /flota/zonas/:id` - Remove zona

## Inventory Module
**Base Path:** `/inventory`

### Products
- `POST /inventory/products` - Create product
- `GET /inventory/products` - Get all products
- `GET /inventory/products/:id` - Get product by ID
- `GET /inventory/products/sku/:sku` - Get product by SKU
- `PATCH /inventory/products/:id` - Update product
- `DELETE /inventory/products/:id` - Delete product

### Stock Management
- `PATCH /inventory/products/:id/stock` - Update stock
- `POST /inventory/products/:id/stock/add` - Add stock
- `GET /inventory/products/:id/stock` - Check stock

### Reserves
- `POST /inventory/reserves` - Reserve stock
- `PATCH /inventory/reserves/:id/confirm` - Confirm reserve
- `PATCH /inventory/reserves/:id/cancel` - Cancel reserve
- `GET /inventory/reserves/pedido/:pedidoId` - Get reserves by pedido

## Pedidos Module
**Base Path:** `/pedidos`

- `POST /pedidos` - Create pedido
- `GET /pedidos/:id` - Get pedido details
- `PATCH /pedidos/:id/cancelar` - Cancel pedido
- `PATCH /pedidos/:id/estado` - Update pedido status
- `POST /pedidos/:id/confirmar` - Confirm pedido

## Tracking Module
**Base Path:** `/tracking`

- `POST /tracking/track` - Update location
- `GET /tracking/repartidor/:id/ubicacion` - Get last location of repartidor
- `GET /tracking/repartidor/:id/historial` - Get location history of repartidor
- `GET /tracking/repartidor/:id/ruta-activa` - Get active route of repartidor
- `POST /tracking/ruta/iniciar` - Start route
- `POST /tracking/ruta/:id/finalizar` - Finish route
- `POST /tracking/ruta/:id/cancelar` - Cancel route
- `GET /tracking/ruta/:id` - Get route by ID

## WebSocket Events
**Namespace:** `/ws`

### Client -> Server (Subscriptions)

- `subscribe:pedido` - Subscribe to order updates
    - Body: `{ pedidoId: string }`
- `unsubscribe:pedido` - Unsubscribe from order updates
    - Body: `{ pedidoId: string }`
- `subscribe:zona` - Subscribe to zone updates (Supervisors)
    - Body: `{ zonaId: string }`
- `subscribe:global` - Subscribe to global events (Admins/Managers only)
    - Body: `None`

### Server -> Client (Emitted Events)

- `connection:success` - Successful connection
    - Payload: `{ message: string, userId: string }`
- `connection:error` - Connection error / invalid session
    - Payload: `{ message: string }`
- `ubicacion:actualizada` - Location update
    - Target Room: `pedido:{pedidoId}`
- `pedido:actualizado` - Order status update
    - Target Rooms: `pedido:{pedidoId}`, `zona:{zonaId}`
- `conductor:asignado` - Driver assigned to order
    - Target Rooms: `pedido:{pedidoId}`, `zona:{zonaId}`
- `entrega:completada` - Order delivery completed
    - Target Rooms: `pedido:{pedidoId}`, `zona:{zonaId}`
- `ruta:iniciada` - Route started
    - Target Room: `pedido:{pedidoId}`
- `ruta:finalizada` - Route finished
    - Target Room: `pedido:{pedidoId}`
- `[Global Event]` - Various global events
    - Target Room: `global`
