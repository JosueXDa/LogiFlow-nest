# WebSocket Server - API Gateway

## Descripción
El API Gateway incluye un servidor WebSocket que permite actualizaciones en tiempo real de eventos del sistema (pedidos, ubicaciones, entregas, etc.).

## Conexión

### URL del WebSocket
```
ws://localhost:3009/ws
```

### Autenticación
El WebSocket requiere autenticación mediante cookies de sesión. La conexión debe incluir:

```javascript
import { io } from 'socket.io-client';

const socket = io('ws://localhost:3009/ws', {
  withCredentials: true, // Enviar cookies
  auth: {
    token: 'opcional-jwt-token'
  }
});
```

## Eventos de Conexión

### `connection:success`
Emitido cuando la conexión se establece exitosamente.
```json
{
  "message": "Conectado exitosamente al WebSocket",
  "userId": "uuid-del-usuario"
}
```

### `connection:error`
Emitido cuando hay un error en la autenticación.
```json
{
  "message": "Sesión inválida o expirada"
}
```

## Suscripciones

### Suscribirse a un Pedido
Recibe actualizaciones de un pedido específico.

**Enviar:**
```javascript
socket.emit('subscribe:pedido', { pedidoId: 'uuid-del-pedido' });
```

**Respuesta:**
```json
{
  "event": "subscribed",
  "room": "pedido:uuid-del-pedido",
  "pedidoId": "uuid-del-pedido"
}
```

### Suscribirse a una Zona (Supervisores)
Recibe actualizaciones de todos los pedidos en una zona.

**Enviar:**
```javascript
socket.emit('subscribe:zona', { zonaId: 'uuid-de-zona' });
```

### Suscribirse a Eventos Globales (Administradores)
Solo disponible para usuarios con rol `admin` o `gerente`.

**Enviar:**
```javascript
socket.emit('subscribe:global');
```

### Desuscribirse
```javascript
socket.emit('unsubscribe:pedido', { pedidoId: 'uuid-del-pedido' });
```

## Eventos Recibidos

### `ubicacion:actualizada`
Actualización de ubicación GPS del repartidor.

```json
{
  "repartidorId": "uuid",
  "pedidoId": "uuid",
  "latitud": -0.1807,
  "longitud": -78.4678,
  "velocidadKmh": 45.5,
  "precision": 10.5,
  "timestamp": "2026-02-05T10:30:00Z"
}
```

### `pedido:actualizado`
Cambio de estado de un pedido.

```json
{
  "pedidoId": "uuid",
  "estado": "ASIGNADO",
  "conductorId": "uuid",
  "timestamp": "2026-02-05T10:30:00Z"
}
```

Estados posibles: `PENDIENTE`, `CONFIRMADO`, `ASIGNADO`, `EN_RUTA`, `ENTREGADO`, `CANCELADO`

### `conductor:asignado`
Un conductor ha sido asignado al pedido.

```json
{
  "pedidoId": "uuid",
  "conductorId": "uuid",
  "tiempoEstimadoMin": 15,
  "timestamp": "2026-02-05T10:30:00Z"
}
```

### `entrega:completada`
El pedido ha sido entregado exitosamente.

```json
{
  "pedidoId": "uuid",
  "timestamp": "2026-02-05T10:30:00Z"
}
```

### `ruta:iniciada`
El repartidor ha iniciado la ruta.

```json
{
  "rutaId": "uuid",
  "pedidoId": "uuid",
  "repartidorId": "uuid",
  "timestamp": "2026-02-05T10:30:00Z"
}
```

### `ruta:finalizada`
La ruta ha sido completada.

```json
{
  "rutaId": "uuid",
  "pedidoId": "uuid",
  "timestamp": "2026-02-05T10:30:00Z"
}
```

## Ejemplo de Implementación (React)

```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function usePedidoRealtime(pedidoId: string) {
  const [pedidoData, setPedidoData] = useState<any>(null);
  const [ubicacion, setUbicacion] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Conectar al WebSocket
    const newSocket = io('ws://localhost:3009/ws', {
      withCredentials: true,
    });

    newSocket.on('connection:success', (data) => {
      console.log('✅ Conectado al WebSocket:', data);
      // Suscribirse al pedido
      newSocket.emit('subscribe:pedido', { pedidoId });
    });

    newSocket.on('connection:error', (error) => {
      console.error('❌ Error de conexión:', error);
    });

    // Escuchar actualizaciones del pedido
    newSocket.on('pedido:actualizado', (data) => {
      console.log('📦 Pedido actualizado:', data);
      setPedidoData(data);
    });

    // Escuchar actualizaciones de ubicación
    newSocket.on('ubicacion:actualizada', (data) => {
      console.log('📍 Ubicación actualizada:', data);
      setUbicacion(data);
    });

    // Escuchar conductor asignado
    newSocket.on('conductor:asignado', (data) => {
      console.log('🚗 Conductor asignado:', data);
    });

    setSocket(newSocket);

    return () => {
      // Desuscribirse y desconectar
      if (newSocket) {
        newSocket.emit('unsubscribe:pedido', { pedidoId });
        newSocket.close();
      }
    };
  }, [pedidoId]);

  return { pedidoData, ubicacion, socket };
}

export default usePedidoRealtime;
```

## Ejemplo de Implementación (JavaScript Vanilla)

Ver el archivo [websocket-test.html](./websocket-test.html) para un ejemplo completo.

## Logs del Servidor

El servidor registra todas las conexiones y eventos:
- ✅ Cliente conectado
- ❌ Cliente desconectado
- 📍 Broadcast ubicación
- 📦 Broadcast pedido actualizado
- 🚗 Broadcast conductor asignado
- etc.

## Seguridad

- **Autenticación obligatoria**: Todos los clientes deben estar autenticados
- **Validación de sesión**: Se valida contra el Auth Service
- **Control de acceso por roles**: 
  - Clientes: Solo sus propios pedidos
  - Supervisores: Pedidos de su zona
  - Administradores: Eventos globales

## Troubleshooting

### Error: "Sesión inválida o expirada"
- Asegúrate de estar autenticado en el sistema
- Verifica que las cookies se estén enviando (`withCredentials: true`)

### No recibo eventos
- Verifica que te hayas suscrito al tópico correcto
- Comprueba que el evento esté siendo emitido por el backend (ver logs)
- Verifica que RabbitMQ esté corriendo

### Desconexión automática
- Revisa los logs del servidor para ver el motivo
- Puede ser por token inválido o sesión expirada
