# Tracking Service - Configuración

## Variables de Entorno

Crear archivo `.env` en `apps/tracking-service/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5437
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tracking_db

# TCP
TCP_HOST=0.0.0.0
TCP_PORT=4008

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# Environment
NODE_ENV=development
```

## Iniciar Servicios

### 1. Iniciar Base de Datos

```bash
docker-compose up -d postgres-tracking
```

### 2. Instalar Dependencias

```bash
cd apps/tracking-service
pnpm install
```

### 3. Iniciar Servicio

```bash
cd apps/tracking-service
pnpm start:dev
```

## Endpoints Disponibles

### POST /tracking/track
Actualizar ubicación GPS del repartidor

**Request:**
```json
{
  "repartidorId": "uuid",
  "pedidoId": "uuid",
  "latitud": -0.1807,
  "longitud": -78.4678,
  "velocidadKmh": 45.5,
  "precision": 10.5,
  "altitud": 2850,
  "rumbo": 180
}
```

### GET /tracking/repartidor/:id/ubicacion
Obtener última ubicación del repartidor

### GET /tracking/repartidor/:id/historial
Obtener historial de ubicaciones

**Query params:**
- `fechaDesde`: Date
- `fechaHasta`: Date
- `limit`: number (default: 100)

### GET /tracking/repartidor/:id/ruta-activa
Obtener ruta activa del repartidor

### POST /tracking/ruta/iniciar
Iniciar tracking de ruta

**Request:**
```json
{
  "pedidoId": "uuid",
  "repartidorId": "uuid",
  "origenLat": -0.1807,
  "origenLng": -78.4678,
  "origenDireccion": "Centro de Quito",
  "destinoLat": -0.2299,
  "destinoLng": -78.5249,
  "destinoDireccion": "Norte de Quito"
}
```

### POST /tracking/ruta/:id/finalizar
Finalizar ruta

### POST /tracking/ruta/:id/cancelar
Cancelar ruta

### GET /tracking/ruta/:id
Obtener ruta por ID

## Eventos Emitidos

### repartidor.ubicacion.actualizada
```json
{
  "eventName": "repartidor.ubicacion.actualizada",
  "timestamp": "2026-01-31T16:45:00Z",
  "data": {
    "repartidorId": "uuid",
    "pedidoId": "uuid",
    "latitud": -0.1807,
    "longitud": -78.4678,
    "velocidadKmh": 45.5,
    "precision": 10.5,
    "timestamp": "2026-01-31T16:45:00Z"
  }
}
```

### ruta.iniciada
```json
{
  "eventName": "ruta.iniciada",
  "timestamp": "2026-01-31T16:45:00Z",
  "data": {
    "rutaId": "uuid",
    "pedidoId": "uuid",
    "repartidorId": "uuid",
    "origenLat": -0.1807,
    "origenLng": -78.4678,
    "destinoLat": -0.2299,
    "destinoLng": -78.5249,
    "timestamp": "2026-01-31T16:45:00Z"
  }
}
```

### ruta.finalizada
```json
{
  "eventName": "ruta.finalizada",
  "timestamp": "2026-01-31T17:20:00Z",
  "data": {
    "rutaId": "uuid",
    "pedidoId": "uuid",
    "repartidorId": "uuid",
    "distanciaRecorridaKm": 12.5,
    "duracionMinutos": 35,
    "timestamp": "2026-01-31T17:20:00Z"
  }
}
```

## Pruebas

### Script de Simulación

```bash
node scripts/test-tracking.mjs
```

Este script simula:
1. Inicio de ruta
2. Envío de 10 puntos GPS cada 2 segundos
3. Consulta de última ubicación
4. Finalización de ruta
