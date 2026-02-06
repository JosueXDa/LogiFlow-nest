# Clasificación de Endpoints y WebSockets por Roles - LogiFlow

Este documento clasifica los endpoints HTTP y eventos WebSocket disponibles en el API Gateway según los roles y responsabilidades del proyecto.

[cite_start]**Namespace WebSocket:** `/ws` 
[cite_start]**Eventos de Conexión:** `connection:success`, `connection:error` [cite: 29, 30]

---

## 1. Público / Común
Endpoints accesibles sin un rol específico o necesarios para la inicialización.

**HTTP**
- [cite_start]`GET /` - Verificar estado del API Gateway [cite: 4]
- [cite_start]`ALL /api/auth/*` - Proxy al Servicio de Autenticación (Login, Registro, Refresh) [cite: 7]
- [cite_start]`GET /inventory/products` - Obtener todos los productos [cite: 52]
- [cite_start]`GET /inventory/products/:id` - Obtener producto por ID [cite: 53]
- [cite_start]`GET /inventory/products/sku/:sku` - Obtener producto por SKU [cite: 54]
- [cite_start]`GET /inventory/products/:id/stock` - Consultar stock disponible [cite: 58]

---

## 2. Rol: Cliente
El cliente gestiona sus pedidos y realiza el seguimiento en tiempo real.

**HTTP**
- [cite_start]`POST /pedidos` - Crear un nuevo pedido [cite: 63]
- [cite_start]`GET /pedidos/:id` - Consultar detalles del pedido [cite: 64]
- [cite_start]`PATCH /pedidos/:id/cancelar` - Cancelar pedido [cite: 65]
- [cite_start]`GET /tracking/repartidor/:id/ubicacion` - Ver ubicación del repartidor [cite: 69]
- [cite_start]`GET /billing/invoices/order/:pedidoId` - Obtener factura por ID de pedido [cite: 13]
- [cite_start]`POST /billing/calculate-tariff` - Calcular tarifa estimada [cite: 9]

**WebSocket (Tiempo Real)**
*Suscripción al canal de su pedido específico.*
- **Emitir (Client -> Server):**
    - [cite_start]`subscribe:pedido` - Suscribirse a actualizaciones de un pedido (`{ pedidoId: string }`) [cite: 26]
    - [cite_start]`unsubscribe:pedido` - Desuscribirse [cite: 27]
- **Recibir (Server -> Client):**
    - [cite_start]`ubicacion:actualizada` - Nueva ubicación del repartidor (Room: `pedido:{id}`) [cite: 31]
    - [cite_start]`pedido:actualizado` - Cambio de estado del pedido (Room: `pedido:{id}`) [cite: 32]
    - [cite_start]`conductor:asignado` - Repartidor asignado (Room: `pedido:{id}`) [cite: 33]
    - [cite_start]`entrega:completada` - Pedido entregado (Room: `pedido:{id}`) [cite: 34]

---

## 3. Rol: Repartidor
Ejecución de entregas, gestión de rutas y emisión de ubicación.

**HTTP**
- [cite_start]`POST /flota/asignaciones/:id/iniciar` - Iniciar la asignación [cite: 20]
- [cite_start]`POST /flota/asignaciones/finalizar` - Finalizar la asignación [cite: 21]
- [cite_start]`PATCH /flota/repartidores/:id/estado` - Actualizar estado (Disponible, En Ruta) [cite: 30]
- [cite_start]`POST /tracking/track` - Actualizar ubicación GPS [cite: 68]
- [cite_start]`POST /tracking/ruta/iniciar` - Iniciar ruta de entrega [cite: 72]
- [cite_start]`POST /tracking/ruta/:id/finalizar` - Finalizar ruta [cite: 73]
- [cite_start]`POST /tracking/ruta/:id/cancelar` - Cancelar ruta [cite: 74]
- [cite_start]`GET /tracking/ruta/:id` - Ver detalles de ruta activa [cite: 75]
- [cite_start]`POST /pedidos/:id/confirmar` - Confirmar entrega realizada [cite: 67]
- [cite_start]`PATCH /pedidos/:id/estado` - Actualizar estado del pedido [cite: 66]

**WebSocket (Tiempo Real)**
*El repartidor principalmente genera eventos, pero recibe confirmaciones de ruta.*
- **Recibir (Server -> Client):**
    - [cite_start]`ruta:iniciada` - Confirmación de inicio de ruta [cite: 35]
    - [cite_start]`ruta:finalizada` - Confirmación de fin de ruta [cite: 36]
    - [cite_start]`pedido:actualizado` - Actualizaciones del pedido (ej. cancelado por cliente) [cite: 32]

---

## 4. Rol: Supervisor
Monitoreo operativo de zona y gestión de flota.

**HTTP**
- [cite_start]`POST /flota/asignaciones` - Asignar repartidor manualmente [cite: 19]
- [cite_start]`GET /flota/disponibilidad/zona/:zonaId` - Consultar disponibilidad por zona [cite: 23]
- [cite_start]`GET /flota/repartidores/disponibles` - Listar repartidores disponibles [cite: 27]
- [cite_start]`GET /flota/vehiculos/disponibles` - Listar vehículos disponibles [cite: 36]
- [cite_start]`GET /tracking/repartidor/:id/historial` - Ver historial de ubicación [cite: 70]
- [cite_start]`GET /tracking/repartidor/:id/ruta-activa` - Ver ruta activa [cite: 71]
- [cite_start]`GET /billing/daily-report` - Reporte diario de operaciones [cite: 17]

**WebSocket (Tiempo Real)**
*Suscripción a eventos de toda una zona geográfica.*
- **Emitir (Client -> Server):**
    - [cite_start]`subscribe:zona` - Suscribirse a eventos de una zona (`{ zonaId: string }`) [cite: 28]
- **Recibir (Server -> Client):**
    - [cite_start]`pedido:actualizado` - Cambios de estado de cualquier pedido en la zona [cite: 32]
    - [cite_start]`conductor:asignado` - Asignaciones en la zona [cite: 33]
    - [cite_start]`entrega:completada` - Entregas finalizadas en la zona [cite: 34]

---

## 5. Rol: Gerente / Administrador
Configuración global, gestión de recursos, inventario y finanzas.

**HTTP - Gestión de Flota**
- [cite_start]`POST /flota/repartidores` - Crear repartidor 
- [cite_start]`GET /flota/repartidores` - Listar todos los repartidores [cite: 26]
- [cite_start]`PATCH /flota/repartidores/:id` - Actualizar repartidor [cite: 29]
- [cite_start]`DELETE /flota/repartidores/:id` - Eliminar repartidor [cite: 31]
- [cite_start]`POST /flota/vehiculos` - Crear vehículo [cite: 34]
- [cite_start]`PATCH /flota/vehiculos/:id` - Actualizar vehículo [cite: 38]
- [cite_start]`POST /flota/zonas` - Crear zona [cite: 40]
- [cite_start]`PATCH /flota/zonas/:id` - Actualizar zona [cite: 43]
- [cite_start]`DELETE /flota/zonas/:id` - Eliminar zona [cite: 44]

**HTTP - Inventario y Finanzas**
- [cite_start]`POST /inventory/products` - Crear producto [cite: 51]
- [cite_start]`PATCH /inventory/products/:id` - Actualizar producto [cite: 55]
- [cite_start]`POST /inventory/products/:id/stock/add` - Añadir stock [cite: 57]
- [cite_start]`POST /billing/invoices` - Crear borrador de factura [cite: 10]
- [cite_start]`PATCH /billing/invoices/:id/emit` - Emitir factura [cite: 14]
- [cite_start]`PATCH /billing/invoices/:id/cancel` - Cancelar factura [cite: 16]

**WebSocket (Tiempo Real)**
*Visión global del sistema.*
- **Emitir (Client -> Server):**
    - [cite_start]`subscribe:global` - Suscribirse a eventos globales del sistema [cite: 29]
- **Recibir (Server -> Client):**
    - [cite_start]`[Global Event]` - Eventos críticos o métricas globales [cite: 37]

---

## 6. Sistema / Procesos Internos (Saga)
Endpoints para orquestación entre microservicios.

**HTTP**
- [cite_start]`POST /inventory/reserves` - Reservar stock (Saga Pedido) [cite: 60]
- [cite_start]`PATCH /inventory/reserves/:id/confirm` - Confirmar reserva [cite: 61]
- [cite_start]`PATCH /inventory/reserves/:id/cancel` - Cancelar reserva [cite: 62]
- [cite_start]`POST /billing/invoices/:id/payment` - Registrar pago [cite: 15]