import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventsGateway } from './events.gateway';

@Controller()
export class WebSocketRelayConsumer {
  private readonly logger = new Logger(WebSocketRelayConsumer.name);

  constructor(private readonly eventsGateway: EventsGateway) {}

  // ======= EVENTOS DE TRACKING =======
  @EventPattern('repartidor.ubicacion.actualizada')
  handleUbicacionActualizada(@Payload() data: any) {
    this.logger.debug(`📍 Evento recibido: repartidor.ubicacion.actualizada - Pedido: ${data.pedidoId}`);
    this.eventsGateway.broadcastUbicacionActualizada(data);
  }

  @EventPattern('ruta.iniciada')
  handleRutaIniciada(@Payload() data: any) {
    this.logger.debug(`🚀 Evento recibido: ruta.iniciada - Pedido: ${data.pedidoId}`);
    this.eventsGateway.broadcastRutaIniciada(data);
  }

  @EventPattern('ruta.finalizada')
  handleRutaFinalizada(@Payload() data: any) {
    this.logger.debug(`🏁 Evento recibido: ruta.finalizada - Pedido: ${data.pedidoId}`);
    this.eventsGateway.broadcastRutaFinalizada(data);
  }

  // ======= EVENTOS DE PEDIDOS =======
  @EventPattern('pedido.creado')
  handlePedidoCreado(@Payload() data: any) {
    this.logger.debug(`📦 Evento recibido: pedido.creado - ID: ${data.pedidoId}`);
    this.eventsGateway.broadcastPedidoActualizado({
      ...data,
      estado: 'PENDIENTE',
      timestamp: new Date().toISOString(),
    });
    // También broadcast global para dashboards
    this.eventsGateway.broadcastGlobalEvent('pedido:creado', data);
  }

  @EventPattern('pedido.confirmado')
  handlePedidoConfirmado(@Payload() data: any) {
    this.logger.debug(`✅ Evento recibido: pedido.confirmado - ID: ${data.pedidoId}`);
    this.eventsGateway.broadcastPedidoActualizado({
      ...data,
      estado: 'CONFIRMADO',
      timestamp: new Date().toISOString(),
    });
  }

  @EventPattern('pedido.cancelado')
  handlePedidoCancelado(@Payload() data: any) {
    this.logger.debug(`❌ Evento recibido: pedido.cancelado - ID: ${data.pedidoId}`);
    this.eventsGateway.broadcastPedidoActualizado({
      ...data,
      estado: 'CANCELADO',
      timestamp: new Date().toISOString(),
    });
  }

  @EventPattern('pedido.entregado')
  handlePedidoEntregado(@Payload() data: any) {
    this.logger.debug(`🎉 Evento recibido: pedido.entregado - ID: ${data.pedidoId}`);
    this.eventsGateway.broadcastPedidoActualizado({
      ...data,
      estado: 'ENTREGADO',
      timestamp: new Date().toISOString(),
    });
  }

  // ======= EVENTOS DE FLEET =======
  @EventPattern('conductor.asignado')
  handleConductorAsignado(@Payload() data: any) {
    this.logger.debug(`🚗 Evento recibido: conductor.asignado - Pedido: ${data.pedidoId}, Conductor: ${data.conductorId}`);
    this.eventsGateway.broadcastConductorAsignado({
      ...data,
      timestamp: new Date().toISOString(),
    });
    // También actualizar estado del pedido
    this.eventsGateway.broadcastPedidoActualizado({
      pedidoId: data.pedidoId,
      estado: 'ASIGNADO',
      conductorId: data.conductorId,
      timestamp: new Date().toISOString(),
    });
  }

  @EventPattern('entrega.completada')
  handleEntregaCompletada(@Payload() data: any) {
    this.logger.debug(`✅ Evento recibido: entrega.completada - Pedido: ${data.pedidoId}`);
    this.eventsGateway.broadcastEntregaCompletada(data);
    // También actualizar estado del pedido
    this.eventsGateway.broadcastPedidoActualizado({
      pedidoId: data.pedidoId,
      estado: 'ENTREGADO',
      timestamp: new Date().toISOString(),
    });
  }

  @EventPattern('fleet.asignacion.failed')
  handleAsignacionFallida(@Payload() data: any) {
    this.logger.warn(`⚠️ Evento recibido: fleet.asignacion.failed - Pedido: ${data.pedidoId}`);
    this.eventsGateway.broadcastPedidoActualizado({
      pedidoId: data.pedidoId,
      estado: 'PENDIENTE',
      error: 'No se pudo asignar conductor',
      timestamp: new Date().toISOString(),
    });
  }

  // ======= EVENTOS DE BILLING =======
  @EventPattern('factura.emitida')
  handleFacturaEmitida(@Payload() data: any) {
    this.logger.debug(`💰 Evento recibido: factura.emitida - Pedido: ${data.pedidoId}`);
    this.eventsGateway.broadcastGlobalEvent('factura:emitida', data);
  }

  @EventPattern('factura.anulada')
  handleFacturaAnulada(@Payload() data: any) {
    this.logger.debug(`📄 Evento recibido: factura.anulada - ID: ${data.facturaId}`);
    this.eventsGateway.broadcastGlobalEvent('factura:anulada', data);
  }

  // ======= EVENTOS DE INVENTORY =======
  @EventPattern('stock.insuficiente')
  handleStockInsuficiente(@Payload() data: any) {
    this.logger.warn(`⚠️ Evento recibido: stock.insuficiente - Producto: ${data.productoId}`);
    this.eventsGateway.broadcastGlobalEvent('stock:insuficiente', data);
    
    // Si está asociado a un pedido, notificar
    if (data.pedidoId) {
      this.eventsGateway.broadcastPedidoActualizado({
        pedidoId: data.pedidoId,
        estado: 'CANCELADO',
        error: 'Stock insuficiente',
        timestamp: new Date().toISOString(),
      });
    }
  }
}
