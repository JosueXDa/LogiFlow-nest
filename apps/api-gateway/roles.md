--

## 2. Rol: Cliente
[cite_start]**Enfoque:** Creación de pedidos, seguimiento y consulta de historial[cite: 60].

| Módulo | Método | Endpoint | Justificación |
| :--- | :--- | :--- | :--- |
| **Pedidos** | `POST` | `/pedidos` | Crear nuevos pedidos. |
| **Pedidos** | `GET` | `/pedidos/:id` | Consultar estado de su pedido. |
| **Pedidos** | `PATCH` | `/pedidos/:id/cancelar` | [cite_start]Cancelar pedido (antes del despacho)[cite: 60]. |
| **Facturación**| `POST` | `/billing/calculate-tariff`| Ver costo estimado antes de pedir. |
| **Facturación**| `GET` | `/billing/invoices/order/:pedidoId` | Obtener recibo/factura de su pedido. |
| **Inventario** | `GET` | `/inventory/products` | Ver catálogo para armar el pedido. |
| **Inventario** | `GET` | `/inventory/products/:id` | Ver detalle de producto. |

---

## 3. Rol: Repartidor
[cite_start]**Enfoque:** Gestión de entregas asignadas y actualización de estado propio[cite: 61].

| Módulo | Método | Endpoint | Justificación |
| :--- | :--- | :--- | :--- |
| **Flota** | `GET` | `/flota/repartidores/:id` | Ver su propio perfil. |
| **Flota** | `PATCH` | `/flota/repartidores/:id/estado` | [cite_start]Cambiar estado (DISPONIBLE, EN RUTA)[cite: 84]. |
| **Flota** | `GET` | `/flota/asignaciones` | Ver tareas asignadas (Filtro por su ID). |
| **Flota** | `POST` | `/flota/asignaciones/:id/iniciar` | Iniciar ruta de entrega. |
| **Flota** | `POST` | `/flota/asignaciones/finalizar` | Confirmar entrega completada. |
| **Pedidos** | `GET` | `/pedidos/:id` | Ver detalles del pedido a entregar. |
| **Pedidos** | `PATCH` | `/pedidos/:id/estado` | Actualizar estado del pedido (Entregado). |

---

## 4. Rol: Supervisor
[cite_start]**Enfoque:** Gestión de zona, reasignación manual y reportes diarios[cite: 62].

*Nota: El Supervisor tiene acceso a todos los endpoints del Repartidor, más los siguientes:*

| Módulo | Método | Endpoint | Justificación |
| :--- | :--- | :--- | :--- |
| **Flota** | `GET` | `/flota/disponibilidad/zona/:zonaId` | Ver mapa de flota en su zona. |
| **Flota** | `GET` | `/flota/repartidores` | Listar repartidores en su zona. |
| **Flota** | `POST` | `/flota/asignaciones` | Asignación manual de pedidos. |
| **Facturación**| `GET` | `/billing/daily-report` | [cite_start]Descargar reporte diario operativo[cite: 62]. |
| **Pedidos** | `GET` | `/pedidos` | Ver todos los pedidos de la zona. |
| **Pedidos** | `PATCH` | `/pedidos/:id/estado` | Corregir estados de pedidos manualmente. |

---

## 5. Rol: Gerente / Administrador
[cite_start]**Enfoque:** Gestión total, KPIs financieros, inventario y configuración de flota[cite: 63].

*Nota: Tiene acceso a **todos** los endpoints del sistema. A continuación se listan los exclusivos de administración.*

### 5.1 Gestión de Recursos (CRUDs)
| Módulo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Flota** | `POST/DELETE`| `/flota/repartidores` | Alta/Baja de personal. |
| **Flota** | `POST/PATCH` | `/flota/vehiculos` | Gestión de flota vehicular. |
| **Inventario** | `POST/PATCH` | `/inventory/products` | Gestión del catálogo de productos. |
| **Inventario** | `POST` | `/inventory/products/:id/stock/add`| Reposición de stock. |

### 5.2 Gestión Financiera y Auditoría
| Módulo | Método | Endpoint | Descripción |
| :--- | :--- | :--- | :--- |
| **Facturación**| `GET` | `/billing/invoices` | Listado global de facturación. |
| **Facturación**| `PATCH` | `/billing/invoices/:id/cancel` | Anulación de facturas (Nota de crédito). |
| **Facturación**| `PATCH` | `/billing/invoices/:id/emit` | Emisión formal ante ente regulador. |
| **Facturación**| `POST` | `/billing/invoices/:id/payment` | Registro manual de pagos. |

---

## 6. Endpoints de Sistema (Internal / Sagas)
*Estos endpoints suelen ser consumidos por otros microservicios (Saga Orchestrator) o por el Frontend en procesos automáticos, pero requieren permisos elevados si se llaman directamente.*

| Método | Endpoint | Flujo Asociado |