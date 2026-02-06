import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Logger, UseGuards, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Roles } from '../decorators/roles.decorator';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3009',
      'http://localhost:4000',
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/ws',
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);

  async handleConnection(client: Socket) {
    try {
      // Extraer token del handshake
      const token = client.handshake.auth.token || client.handshake.headers.authorization;

      if (!token) {
        this.logger.warn(`Cliente ${client.id} intentó conectar sin token`);
        client.disconnect();
        return;
      }

      // Validar sesión con Auth Service
      const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
      const cookies = client.handshake.headers.cookie;

      if (cookies) {
        try {
          const response = await fetch(`${authServiceUrl}/api/auth/get-session`, {
            method: 'GET',
            headers: {
              Cookie: cookies,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const sessionData = await response.json();
            if (sessionData?.user) {
              // Guardar datos del usuario en el socket
              (client as any).user = sessionData.user;
              this.logger.log(`✅ Cliente conectado: ${client.id} - Usuario: ${sessionData.user.name || sessionData.user.email}`);

              // Mensaje de bienvenida
              client.emit('connection:success', {
                message: 'Conectado exitosamente al WebSocket',
                userId: sessionData.user.id,
              });
              return;
            }
          }
        } catch (error) {
          this.logger.error(`Error validando sesión para cliente ${client.id}:`, error.message);
        }
      }

      // Si llegamos aquí, la validación falló
      this.logger.warn(`Cliente ${client.id} - Sesión inválida o expirada`);
      client.emit('connection:error', { message: 'Sesión inválida o expirada' });
      client.disconnect();
    } catch (error) {
      this.logger.error(`Error en handleConnection:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    this.logger.log(`❌ Cliente desconectado: ${client.id}${user ? ` - Usuario: ${user.name || user.email}` : ''}`);
  }

  // Suscribirse a un pedido específico
  @SubscribeMessage('subscribe:pedido')
  @Roles('CLIENTE')
  handleSubscribePedido(
    @MessageBody() data: { pedidoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `pedido:${data.pedidoId}`;
    client.join(room);
    this.logger.log(`Cliente ${client.id} suscrito a ${room}`);
    return { event: 'subscribed', room, pedidoId: data.pedidoId };
  }

  // Desuscribirse de un pedido
  @SubscribeMessage('unsubscribe:pedido')
  @Roles('CLIENTE')
  handleUnsubscribePedido(
    @MessageBody() data: { pedidoId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `pedido:${data.pedidoId}`;
    client.leave(room);
    this.logger.log(`Cliente ${client.id} desuscrito de ${room}`);
    return { event: 'unsubscribed', room, pedidoId: data.pedidoId };
  }

  // Suscribirse a una zona (para supervisores)
  @SubscribeMessage('subscribe:zona')
  @Roles('SUPERVISOR')
  handleSubscribeZona(
    @MessageBody() data: { zonaId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `zona:${data.zonaId}`;
    client.join(room);
    this.logger.log(`Cliente ${client.id} suscrito a ${room}`);
    return { event: 'subscribed', room, zonaId: data.zonaId };
  }

  // Suscribirse a eventos globales (para administradores)
  @SubscribeMessage('subscribe:global')
  @Roles('ADMIN', 'GERENTE')
  handleSubscribeGlobal(@ConnectedSocket() client: Socket) {
    const user = (client as any).user;

    // Solo permitir a usuarios con rol admin/gerente
    if (user?.role !== 'admin' && user?.role !== 'gerente') {
      return { event: 'error', message: 'No tienes permisos para suscribirte a eventos globales' };
    }

    const room = 'global';
    client.join(room);
    this.logger.log(`Cliente ${client.id} suscrito a eventos globales`);
    return { event: 'subscribed', room: 'global' };
  }

  // Métodos para broadcast desde el consumer
  broadcastUbicacionActualizada(data: any) {
    const room = `pedido:${data.pedidoId}`;
    this.server.to(room).emit('ubicacion:actualizada', data);
    this.logger.debug(`📍 Broadcast ubicación a ${room}`);
  }

  broadcastPedidoActualizado(data: any) {
    const room = `pedido:${data.pedidoId}`;
    this.server.to(room).emit('pedido:actualizado', data);
    this.logger.debug(`📦 Broadcast pedido actualizado a ${room}`);

    // También enviar a la zona si está disponible
    if (data.zonaId) {
      this.server.to(`zona:${data.zonaId}`).emit('pedido:actualizado', data);
    }
  }

  broadcastConductorAsignado(data: any) {
    const room = `pedido:${data.pedidoId}`;
    this.server.to(room).emit('conductor:asignado', data);
    this.logger.debug(`🚗 Broadcast conductor asignado a ${room}`);

    // También enviar a la zona
    if (data.zonaId) {
      this.server.to(`zona:${data.zonaId}`).emit('conductor:asignado', data);
    }
  }

  broadcastEntregaCompletada(data: any) {
    const room = `pedido:${data.pedidoId}`;
    this.server.to(room).emit('entrega:completada', data);
    this.logger.debug(`✅ Broadcast entrega completada a ${room}`);

    if (data.zonaId) {
      this.server.to(`zona:${data.zonaId}`).emit('entrega:completada', data);
    }
  }

  broadcastRutaIniciada(data: any) {
    const room = `pedido:${data.pedidoId}`;
    this.server.to(room).emit('ruta:iniciada', data);
    this.logger.debug(`🚀 Broadcast ruta iniciada a ${room}`);
  }

  broadcastRutaFinalizada(data: any) {
    const room = `pedido:${data.pedidoId}`;
    this.server.to(room).emit('ruta:finalizada', data);
    this.logger.debug(`🏁 Broadcast ruta finalizada a ${room}`);
  }

  // Broadcast a eventos globales (para dashboards de administradores)
  broadcastGlobalEvent(eventName: string, data: any) {
    this.server.to('global').emit(eventName, data);
    this.logger.debug(`🌐 Broadcast global: ${eventName}`);
  }
}
