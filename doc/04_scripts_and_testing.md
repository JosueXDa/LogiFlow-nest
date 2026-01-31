# Scripts de Prueba y Datos (Seeding)

Se han creado scripts automatizados en el directorio `scripts/` para facilitar la carga de datos y la prueba del flujo completo.

## Requisitos Previos
-   Node.js instalado (`node -v` >= 18).
-   Todos los microservicios y el API Gateway corriendo (`localhost:3009`).
-   Base de datos disponible.

## 1. Seed de Inventario (`seed-inventory.mjs`)
Carga productos iniciales en el sistema.
-   **Uso**: `node scripts/seed-inventory.mjs`
-   **Datos**: Crea 10 productos tecnológicos (Laptops, Monitores, etc).
-   **Nota**: Inicia sesión automáticamente como `abel@test.com`.

## 2. Seed de Flota (`seed-fleet.mjs`)
Carga vehículos y conductores para permitir la asignación.
-   **Uso**: `node scripts/seed-fleet.mjs`
-   **Datos**:
    -   3 Vehículos (Motos, Bicicleta).
    -   3 Repartidores (Juan, María, Carlos) en diferentes zonas.

## 3. Simulación de Flujo (`simulate-order-flow.mjs`)
Ejecuta una prueba End-to-End del ciclo de vida del pedido.
-   **Uso**: `node scripts/simulate-order-flow.mjs`
-   **Pasos que realiza**:
    1.  **Login**: Obtiene token de sesión.
    2.  **Crear Pedido**: Compra `PROD-001` y `PROD-002`.
    3.  **Confirmar**: Llama al endpoint de confirmación manual.
    4.  **Polling**: Consulta el estado del pedido cada 2 segundos.
    5.  **Verificación**: Espera hasta que el estado cambie a `ASIGNADO` (demostrando que Fleet Service reaccionó).

---

## Verificación Manual
Puede verificar los resultados en los logs de los microservicios:
-   **Pedidos**: Verá "Evento recibido: conductor.asignado".
-   **Fleet**: Verá "Evento publicado: conductor.asignado".
-   **Billing**: Verá "Factura emitida" tras la confirmación.
