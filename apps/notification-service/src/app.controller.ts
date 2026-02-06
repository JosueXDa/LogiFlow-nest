import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @EventPattern('pedido.creado')
  handlePedidoCreado(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Evento recibido: pedido.creado`, data);
    this.appService.sendNotification(data);
    
    // Acknowledgement manual si fuera necesario (depende de la config)
    // const channel = context.getChannelRef();
    // const originalMsg = context.getMessage();
    // channel.ack(originalMsg);
  }

  @EventPattern('pedido.estado.actualizado')
  handlePedidoActualizado(@Payload() data: any) {
    this.logger.log(`Evento recibido: pedido.estado.actualizado`, data);
    this.appService.sendNotification(data);
  }

  // ============ BILLING EVENTS ============
  @EventPattern('factura.generada')
  handleFacturaGenerada(@Payload() data: any) {
    this.logger.log(`📄 Evento recibido: factura.generada - ${data.numeroFactura}`);
    this.appService.sendNotification(data);
  }

  @EventPattern('factura.emitida')
  handleFacturaEmitida(@Payload() data: any) {
    this.logger.log(`📄 Evento recibido: factura.emitida - ${data.numeroFactura}`);
    this.appService.sendNotification(data);
  }

  @EventPattern('factura.pagada')
  handleFacturaPagada(@Payload() data: any) {
    this.logger.log(`💰 Evento recibido: factura.pagada - ${data.numeroFactura}`);
    this.appService.sendNotification(data);
  }

  @EventPattern('factura.anulada')
  handleFacturaAnulada(@Payload() data: any) {
    this.logger.log(`❌ Evento recibido: factura.anulada - ${data.numeroFactura}`);
    this.appService.sendNotification(data);
  }

  // ============ FLEET EVENTS ============
  @EventPattern('fleet.repartidor.created')
  handleRepartidorCreated(@Payload() data: any) {
    this.logger.log(`👤 Evento recibido: fleet.repartidor.created - ${data.repartidorId}`);
    this.appService.sendNotification(data);
  }

  @EventPattern('fleet.repartidor.estado.changed')
  handleRepartidorEstadoChanged(@Payload() data: any) {
    this.logger.log(`🔄 Evento recibido: fleet.repartidor.estado.changed - ${data.repartidorId}`);
    this.appService.sendNotification(data);
  }

  @EventPattern('conductor.asignado')
  handleConductorAsignado(@Payload() data: any) {
    this.logger.log(`🚗 Evento recibido: conductor.asignado - ${data.pedidoId}`);
    this.appService.sendNotification(data);
  }

  @EventPattern('entrega.completada')
  handleEntregaCompletada(@Payload() data: any) {
    this.logger.log(`✅ Evento recibido: entrega.completada - ${data.pedidoId}`);
    this.appService.sendNotification(data);
  }

  // ============ INVENTORY EVENTS ============
  @EventPattern('producto.stock.bajo')
  handleStockBajo(@Payload() data: any) {
    this.logger.log(`⚠️ Evento recibido: producto.stock.bajo - ${data.productoId}`);
    this.appService.sendNotification(data);
  }

  @EventPattern('producto.agotado')
  handleProductoAgotado(@Payload() data: any) {
    this.logger.log(`🚫 Evento recibido: producto.agotado - ${data.productoId}`);
    this.appService.sendNotification(data);
  }

  // ============ TRACKING EVENTS ============
  @EventPattern('ubicacion.actualizada')
  handleUbicacionActualizada(@Payload() data: any) {
    this.logger.log(`📍 Evento recibido: ubicacion.actualizada - ${data.pedidoId}`);
    // No enviar notificación por cada actualización de ubicación (muy frecuente)
  }

  @EventPattern('tracking.iniciado')
  handleTrackingIniciado(@Payload() data: any) {
    this.logger.log(`🚀 Evento recibido: tracking.iniciado - ${data.pedidoId}`);
    this.appService.sendNotification(data);
  }
}
