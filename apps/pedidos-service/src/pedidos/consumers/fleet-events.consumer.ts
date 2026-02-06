import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PEDIDOS_SERVICE } from '../service/pedidos-service.interface';
import type { IPedidosService } from '../service/pedidos-service.interface';

/**
 * Consumer para eventos emitidos por Fleet Service
 * Escucha en fleet_events_queue
 */
@Controller()
export class FleetEventsConsumer {
  private readonly logger = new Logger(FleetEventsConsumer.name);

  constructor(
    @Inject(PEDIDOS_SERVICE)
    private readonly pedidosService: IPedidosService,
  ) {
    this.logger.log('🎯 FleetEventsConsumer inicializado - Esperando eventos de Fleet...');
  }

  /**
   * Maneja el evento 'conductor.asignado' emitido por Fleet Service
   * cuando se asigna un repartidor a un pedido
   */
  @EventPattern('conductor.asignado')
  async handleConductorAsignado(@Payload() payload: any) {
    // Fleet emite evento con estructura: { eventName, timestamp, data }
    const eventData = payload.data || payload;
    
    this.logger.log(`📨 Evento recibido: conductor.asignado - Pedido: ${eventData.pedidoId}`);

    try {
      const { 
        pedidoId, 
        repartidorId, 
        vehiculoId, 
        tiempoEstimadoMin,
        asignacionId 
      } = eventData;

      // Validar datos requeridos
      if (!pedidoId || !repartidorId) {
        this.logger.error('❌ Evento conductor.asignado inválido: faltan pedidoId o repartidorId');
        return;
      }

      // Llamar al método existente del servicio
      await this.pedidosService.handleConductorAsignado({
        pedidoId,
        conductorId: repartidorId, // Mapear repartidorId a conductorId
      });

      this.logger.log(
        `✅ Pedido ${pedidoId} actualizado: ` +
        `repartidorId=${repartidorId}, ` +
        `asignacionId=${asignacionId}, ` +
        `vehiculoId=${vehiculoId}, ` +
        `tiempoEstimado=${tiempoEstimadoMin} min`
      );
    } catch (error) {
      this.logger.error(`❌ Error procesando conductor.asignado:`, error.stack);
      // No relanzar error para evitar reintento infinito
      // TODO: Implementar DLQ para eventos fallidos
    }
  }

  /**
   * Maneja el evento 'asignacion.failed' cuando no se encuentra repartidor disponible
   */
  @EventPattern('asignacion.failed')
  async handleAsignacionFailed(@Payload() payload: any) {
    const eventData = payload.data || payload;
    
    this.logger.warn(`⚠️  Evento recibido: asignacion.failed - Pedido: ${eventData.pedidoId}`);
    this.logger.warn(`   Razón: ${eventData.razon || eventData.reason || 'No disponible'}`);

    try {
      const { pedidoId, razon, reason } = eventData;

      if (!pedidoId) {
        this.logger.error('❌ Evento asignacion.failed inválido: falta pedidoId');
        return;
      }

      // Llamar al método existente del servicio
      await this.pedidosService.handleAsignacionFallida({
        pedidoId,
        razon: razon || reason || 'No se encontró repartidor disponible',
      });

      this.logger.log(`✅ Pedido ${pedidoId} marcado como CANCELADO por falta de repartidor`);
    } catch (error) {
      this.logger.error(`❌ Error procesando asignacion.failed:`, error.stack);
    }
  }

  /**
   * Maneja el evento 'entrega.completada' cuando el repartidor completa la entrega
   */
  @EventPattern('entrega.completada')
  async handleEntregaCompletada(@Payload() payload: any) {
    const eventData = payload.data || payload;
    
    this.logger.log(`📨 Evento recibido: entrega.completada - Pedido: ${eventData.pedidoId}`);

    try {
      const { pedidoId, fecha, timestamp } = eventData;

      if (!pedidoId) {
        this.logger.error('❌ Evento entrega.completada inválido: falta pedidoId');
        return;
      }

      // Llamar al método existente del servicio
      await this.pedidosService.handleEntregaCompletada({
        pedidoId,
        fecha: fecha || new Date(timestamp) || new Date(),
      });

      this.logger.log(`✅ Pedido ${pedidoId} marcado como ENTREGADO`);
    } catch (error) {
      this.logger.error(`❌ Error procesando entrega.completada:`, error.stack);
    }
  }
}
