# Scripts de LogiFlow

Este directorio contiene scripts útiles para la gestión y testing del proyecto LogiFlow.

## 📋 Scripts Disponibles

### 🧹 Limpieza de Bases de Datos

#### `clear-all-databases.mjs` (Node.js)
Script en JavaScript que limpia todas las bases de datos del proyecto.

**Uso:**
```bash
# Opción 1: Directamente
node scripts/clear-all-databases.mjs

# Opción 2: Con npm/pnpm
pnpm db:clear
npm run db:clear
```

**Características:**
- ✅ Limpia las 6 bases de datos PostgreSQL
- ✅ Purga las colas de RabbitMQ
- ✅ Resetea secuencias (auto-increment)
- ✅ Mantiene la estructura de las tablas intacta
- ✅ Usa conexiones nativas de PostgreSQL
- ✅ Reporte detallado con estadísticas

---

#### `clear-all-databases.ps1` (PowerShell)
Script en PowerShell para Windows.

**Uso:**
```powershell
# Opción 1: Directamente
.\scripts\clear-all-databases.ps1

# Opción 2: Con npm/pnpm
pnpm db:clear:ps
npm run db:clear:ps

# Si hay problemas de ejecución:
powershell -ExecutionPolicy Bypass -File .\scripts\clear-all-databases.ps1
```

**Características:**
- ✅ Compatible con Windows
- ✅ Usa Docker exec para conectarse a PostgreSQL
- ✅ Limpia RabbitMQ con rabbitmqadmin
- ✅ Colores en la salida para mejor legibilidad
- ✅ Manejo robusto de errores

---

#### `clear-all-databases.sh` (Bash)
Script en Bash para Linux/macOS.

**Uso:**
```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x scripts/clear-all-databases.sh

# Ejecutar
./scripts/clear-all-databases.sh
```

**Características:**
- ✅ Compatible con Linux y macOS
- ✅ Usa psql directamente
- ✅ Colores en la terminal
- ✅ Manejo de errores

---

### 🌱 Scripts de Seed (Población de Datos)

**NOTA IMPORTANTE:** Todos los scripts de seed requieren autenticación. Los scripts automáticamente crean un usuario administrador si no existe:

**Credenciales del Admin:**
- **Email:** `admin@logiflow.com`
- **Password:** `Admin123!`
- **Role:** `ADMIN`

Este usuario tiene permisos para crear todos los recursos del sistema (productos, repartidores, vehículos, zonas, etc.).

---

#### `seed-fleet.mjs`
Puebla la base de datos de Fleet Service con datos de prueba.

**Uso:**
```bash
node scripts/seed-fleet.mjs
# o
pnpm seed:fleet
```

**Requisitos:**
- API Gateway corriendo en `localhost:3009`
- Fleet Service conectado al API Gateway
- PostgreSQL corriendo

**Crea:**
- 1 usuario ADMIN (si no existe)
- 3 zonas de cobertura (Quito Norte, Quito Sur, Valle de los Chillos)
- 3 vehículos (motorizados, autos, camiones)
- 3 repartidores asignados a diferentes zonas

**Nota:** Las zonas se crean primero porque los repartidores requieren una zona válida (foreign key).

---

#### `seed-inventory.mjs`
Puebla la base de datos de Inventory Service con productos.

**Uso:**
```bash
node scripts/seed-inventory.mjs
# o
pnpm seed:inventory
```

**Requisitos:**
- API Gateway corriendo en `localhost:3009`
- Inventory Service conectado al API Gateway
- PostgreSQL corriendo

**Crea:**
- 1 usuario ADMIN (si no existe)
- 10 productos variados con stock (laptops, monitores, accesorios, etc.)

---

#### `seed-billing.mjs`
Puebla la base de datos de Billing Service con tarifas de transporte.

**Uso:**
```bash
node scripts/seed-billing.mjs
# o
pnpm seed:billing
```

**Requisitos:**
- API Gateway corriendo en `localhost:3009`
- Billing Service conectado al API Gateway
- PostgreSQL corriendo

**Crea:**
- 1 usuario ADMIN (si no existe)
- 3 tarifas:
  * **Urbana Motorizado**: $2.50 base + $0.50/km
  * **Urbana Vehículo Liviano**: $5.00 base + $0.80/km
  * **Intermunicipal Camión**: $50.00 base + $1.20/km + $0.10/kg

**Nota:** Las tarifas son necesarias para calcular costos de envío y generar facturas. Sin tarifas, los cálculos de precios fallarán.

---

### 🔄 Scripts de Simulación

#### `simulate-order-flow.mjs`
Simula un flujo completo de pedido desde la creación hasta la entrega.

**Uso:**
```bash
node scripts/simulate-order-flow.mjs
# o
pnpm simulate:order
```

**Requisitos:**
- Todos los microservicios corriendo
- Usuario ADMIN creado (se crea automáticamente si no existe)

**Simula:**
1. Creación de pedido
2. Asignación de repartidor
3. Actualizaciones de ubicación en tiempo real
4. Finalización de entrega
5. Generación de factura

---

#### `test-tracking.mjs`
Prueba el sistema de tracking enviando múltiples actualizaciones de ubicación.

**Uso:**
```bash
node scripts/test-tracking.mjs
```

---

## 🎯 Flujo de Trabajo Recomendado

### 1. Limpieza Completa
```bash
# Limpiar todas las bases de datos
pnpm db:clear
```

### 2. Repoblar Datos
```bash
# Crear repartidores y vehículos
pnpm seed:fleet

# Crear productos en inventario
pnpm seed:inventory
```

### 3. Simular Operación
```bash
# Simular un pedido completo
pnpm simulate:order
```

---

## 📊 Bases de Datos Afectadas

Los scripts de limpieza trabajan con las siguientes bases de datos:

| Base de Datos    | Puerto | Servicio          |
|------------------|--------|-------------------|
| `auth_db`        | 5432   | Auth Service      |
| `pedidos_db`     | 5433   | Pedidos Service   |
| `fleet_db`       | 5434   | Fleet Service     |
| `inventory_db`   | 5435   | Inventory Service |
| `billing_db`     | 5436   | Billing Service   |
| `tracking_db`    | 5437   | Tracking Service  |

**Credenciales:**
- Usuario: `postgres`
- Contraseña: `postgres`
- Host: `localhost`

---

## ⚠️ Advertencias Importantes

### 🚨 Limpieza de Datos
Los scripts de limpieza:
- ✅ **SÍ** eliminan TODOS los datos de las tablas
- ✅ **NO** eliminan la estructura de las tablas
- ✅ **SÍ** resetean las secuencias (IDs vuelven a 1)
- ✅ **SÍ** purgan las colas de RabbitMQ

**⚠️ NO usar en producción sin un backup completo**

### 🔧 Requisitos Previos

Para que los scripts funcionen correctamente:

1. **Docker debe estar corriendo:**
   ```bash
   docker ps
   # Debe mostrar los contenedores de PostgreSQL y RabbitMQ
   ```

2. **PostgreSQL debe estar disponible:**
   ```bash
   # Probar conexión
   psql -h localhost -p 5432 -U postgres -d auth_db
   ```

3. **Para scripts de Node.js, instalar dependencias:**
   ```bash
   pnpm install
   ```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
**Solución:** Verifica que los contenedores estén corriendo:
```bash
docker-compose up -d
```

### Error: "Password authentication failed"
**Solución:** Las credenciales por defecto son `postgres/postgres`. Verifica tu docker-compose.yml.

### Error en PowerShell: "Execution Policy"
**Solución:** 
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### Script no limpia algunas tablas
**Solución:** Algunas tablas pueden tener foreign keys complejas. El script usa `TRUNCATE CASCADE` que debería manejar esto, pero en caso de problemas, puedes ejecutar manualmente:
```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

---

## 📝 Notas Adicionales

### Secuencias Auto-increment
Los scripts resetean todas las secuencias, por lo que después de limpiar:
- Los IDs comenzarán desde 1
- Los códigos auto-generados (ej: `PED-001`, `FAC-001`) se reiniciarán

### RabbitMQ
Los scripts intentan purgar las siguientes colas:
- `fleet_queue`
- `billing_queue`
- `inventory_queue`
- `pedidos_queue`
- `notification_queue`
- `gateway_queue`

Si alguna cola no existe, simplemente se omite sin error.

### Performance
- **clear-all-databases.mjs**: ~2-5 segundos (conexión directa)
- **clear-all-databases.ps1**: ~5-10 segundos (usa Docker exec)
- **clear-all-databases.sh**: ~2-5 segundos (usa psql directo)

---

## 🔗 Scripts Relacionados

Después de limpiar las bases de datos, considera ejecutar:

1. `pnpm seed:fleet` - Crear datos de flota
2. `pnpm seed:inventory` - Crear productos
3. `pnpm simulate:order` - Probar flujo completo

---

**Última actualización:** 5 de febrero de 2026
