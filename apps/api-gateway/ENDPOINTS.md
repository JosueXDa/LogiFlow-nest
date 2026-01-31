# API Gateway Endpoints Documentation

Este documento detalla todos los endpoints disponibles en el **API Gateway** y hacia qué microservicio se redirigen las peticiones.

---

## **1. Core / General**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Mensaje de bienvenida / Health Check | `api-gateway` (Local) |

---

## **2. Autenticación (`/api/auth`)**

Todos los endpoints bajo `/api/auth` actúan como un proxy hacia el servicio de autenticación.

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `ALL` | `/api/auth/*` | Proxy completo para Better Auth (login, signup, session, etc.) | `auth-service` |

---

## **3. Facturación (`/billing`)**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `POST` | `/billing/calculate-tariff` | Calcula la tarifa estimada para un pedido | `billing-service` |
| `POST` | `/billing/invoices` | Crea un borrador de factura | `billing-service` |
| `GET` | `/billing/invoices` | Lista todas las facturas (soporta filtros por query) | `billing-service` |
| `GET` | `/billing/invoices/:id` | Obtiene el detalle de una factura por ID | `billing-service` |
| `GET` | `/billing/invoices/order/:pedidoId` | Obtiene la factura asociada a un pedido específico | `billing-service` |
| `PATCH` | `/billing/invoices/:id/emit` | Emite formalmente una factura | `billing-service` |
| `POST` | `/billing/invoices/:id/payment` | Registra un pago para una factura | `billing-service` |
| `PATCH` | `/billing/invoices/:id/cancel` | Anula una factura (requiere motivo en el body) | `billing-service` |
| `GET` | `/billing/daily-report` | Genera reporte diario (Parámetros: `date`, `zonaId`) | `billing-service` |

---

## **4. Gestión de Flota (`/flota`)**

### **4.1. Asignaciones (`/flota/asignaciones`)**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `POST` | `/flota/asignaciones` | Crea una nueva asignación de repartidor/vehículo | `fleet-service` |
| `POST` | `/flota/asignaciones/:id/iniciar` | Inicia el proceso de una asignación | `fleet-service` |
| `POST` | `/flota/asignaciones/finalizar` | Finaliza una asignación y libera recursos | `fleet-service` |

### **4.2. Disponibilidad (`/flota/disponibilidad`)**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `GET` | `/flota/disponibilidad/zona/:zonaId` | Consulta repartidores y vehículos disponibles por zona | `fleet-service` |

### **4.3. Repartidores (`/flota/repartidores`)**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `POST` | `/flota/repartidores` | Registra un nuevo repartidor | `fleet-service` |
| `GET` | `/flota/repartidores` | Lista repartidores (Filtros: `page`, `limit`, `estado`, `zonaId`) | `fleet-service` |
| `GET` | `/flota/repartidores/disponibles` | Lista repartidores disponibles (Filtros: `zonaId`) | `fleet-service` |
| `GET` | `/flota/repartidores/:id` | Obtiene detalle de un repartidor | `fleet-service` |
| `PATCH` | `/flota/repartidores/:id` | Actualiza datos de un repartidor | `fleet-service` |
| `PATCH` | `/flota/repartidores/:id/estado` | Cambia el estado del repartidor (Body: `{ estado, motivo }`) | `fleet-service` |
| `DELETE` | `/flota/repartidores/:id` | Elimina lógicamente un repartidor | `fleet-service` |

### **4.4. Vehículos (`/flota/vehiculos`)**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `POST` | `/flota/vehiculos` | Registra un nuevo vehículo | `fleet-service` |
| `GET` | `/flota/vehiculos` | Lista vehículos (Filtros: `page`, `limit`, `placa`, `tipo`, `estado`) | `fleet-service` |
| `GET` | `/flota/vehiculos/disponibles` | Lista vehículos disponibles (Filtro: `tipo`) | `fleet-service` |
| `GET` | `/flota/vehiculos/:id` | Obtiene detalle de un vehículo | `fleet-service` |
| `PATCH` | `/flota/vehiculos/:id` | Actualiza datos de un vehículo | `fleet-service` |

---

## **5. Inventario (`/inventory`)**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `POST` | `/inventory/products` | Crea un nuevo producto | `inventory-service` |
| `GET` | `/inventory/products` | Lista todos los productos | `inventory-service` |
| `GET` | `/inventory/products/:id` | Obtiene detalle de un producto | `inventory-service` |
| `GET` | `/inventory/products/sku/:sku` | Busca un producto por su código SKU | `inventory-service` |
| `PATCH` | `/inventory/products/:id` | Actualiza un producto | `inventory-service` |
| `DELETE` | `/inventory/products/:id` | Elimina un producto | `inventory-service` |
| `PATCH` | `/inventory/products/:id/stock` | Actualización directa de stock | `inventory-service` |
| `POST` | `/inventory/products/:id/stock/add` | Incrementa stock de un producto | `inventory-service` |
| `GET` | `/inventory/products/:id/stock` | Consulta stock actual | `inventory-service` |
| `POST` | `/inventory/reserves` | Crea una reserva de stock para un pedido | `inventory-service` |
| `PATCH` | `/inventory/reserves/:id/confirm` | Confirma una reserva (pasa a venta final) | `inventory-service` |
| `PATCH` | `/inventory/reserves/:id/cancel` | Libera stock de una reserva cancelada | `inventory-service` |
| `GET` | `/inventory/reserves/pedido/:pedidoId` | Lista reservas asociadas a un pedido | `inventory-service` |

---

## **6. Pedidos (`/pedidos`)**

| Método | Endpoint | Descripción | Servicio Destino |
| :--- | :--- | :--- | :--- |
| `POST` | `/pedidos` | Crea un nuevo pedido | `pedidos-service` |
| `GET` | `/pedidos/:id` | Obtiene detalle de un pedido | `pedidos-service` |
| `PATCH` | `/pedidos/:id/cancelar` | Cancela un pedido existente | `pedidos-service` |
| `PATCH` | `/pedidos/:id/estado` | Actualiza el estado de un pedido | `pedidos-service` |

---

## **Notas Adicionales**

1.  **Seguridad**: La mayoría de los endpoints (excepto `/` y algunos de `/api/auth`) están protegidos por `AuthGuard`. Se requiere un token válido en los headers.
2.  **Tecnología**: El API Gateway está construido con **NestJS** y utiliza **ClientProxy** para comunicarse vía TCP/Microservicios con los servicios internos.
