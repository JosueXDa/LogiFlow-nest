import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryEventsController {
  private readonly logger = new Logger(InventoryEventsController.name);

  constructor(private readonly inventoryService: InventoryService) { }

  /**
   * Handler: Pedido Cancelado
   * Libera todas las reservas pendientes asociadas al pedido
   */
  @EventPattern('pedido.cancelado')
  async handlePedidoCancelado(
    @Payload() data: { pedidoId: string; razon?: string },
  ) {
    this.logger.log(
      `📥 Evento recibido: pedido.cancelado - Pedido: ${data.pedidoId}`,
    );
    this.logger.debug(
      `Razón de cancelación: ${data.razon || 'No especificada'}`,
    );

    try {
      const reservas = await this.inventoryService.findReserveByPedidoId(
        data.pedidoId,
      );

      this.logger.log(
        `🔍 Encontradas ${reservas.length} reservas para pedido ${data.pedidoId}`,
      );

      let canceladas = 0;
      for (const reserva of reservas) {
        if (reserva.estado === 'PENDIENTE') {
          await this.inventoryService.cancelReserve(reserva.id);
          canceladas++;
          this.logger.debug(
            `❌ Reserva ${reserva.id} cancelada (Producto: ${reserva.producto.sku})`,
          );
        } else {
          this.logger.debug(
            `⏭️  Reserva ${reserva.id} omitida (Estado: ${reserva.estado})`,
          );
        }
      }

      this.logger.log(
        `✅ Stock liberado para pedido ${data.pedidoId} (${canceladas} reservas canceladas)`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error al cancelar reservas del pedido ${data.pedidoId}:`,
        error.stack,
      );
    }
  }

  /**
   * Handler: Pedido Entregado
   * Confirma todas las reservas pendientes (descuenta del stock total)
   */
  @EventPattern('pedido.entregado')
  async handlePedidoEntregado(@Payload() data: { pedidoId: string }) {
    this.logger.log(
      `📥 Evento recibido: pedido.entregado - Pedido: ${data.pedidoId}`,
    );

    try {
      const reservas = await this.inventoryService.findReserveByPedidoId(
        data.pedidoId,
      );

      this.logger.log(
        `🔍 Encontradas ${reservas.length} reservas para confirmar`,
      );

      let confirmadas = 0;
      for (const reserva of reservas) {
        if (reserva.estado === 'PENDIENTE') {
          await this.inventoryService.confirmReserve(reserva.id);
          confirmadas++;
          this.logger.debug(
            `✅ Reserva ${reserva.id} confirmada (Producto: ${reserva.producto.sku})`,
          );
        } else {
          this.logger.debug(
            `⏭️  Reserva ${reserva.id} omitida (Estado: ${reserva.estado})`,
          );
        }
      }

      this.logger.log(
        `✅ Reservas confirmadas para pedido ${data.pedidoId} (${confirmadas} confirmadas)`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error al confirmar reservas del pedido ${data.pedidoId}:`,
        error.stack,
      );
    }
  }

  /**
   * Handler: Conductor Asignado (Opcional)
   * Podría usarse para marcar el pedido como "en proceso de entrega"
   */
  @EventPattern('conductor.asignado')
  async handleConductorAsignado(
    @Payload()
    data: {
      pedidoId: string;
      conductorId?: string;
      repartidorId?: string;
      tiempoEstimadoLlegada?: number;
      tiempoEstimadoMin?: number;
    },
  ) {
    const conductorId = data.conductorId || data.repartidorId;
    const tiempo = data.tiempoEstimadoLlegada || data.tiempoEstimadoMin;

    this.logger.log(
      `📥 Evento recibido: conductor.asignado - Pedido: ${data.pedidoId}, Conductor: ${conductorId}`,
    );
    this.logger.debug(
      `⏱️ Tiempo estimado de llegada: ${tiempo} minutos`,
    );
    // Lógica opcional: actualizar estado de reservas o registrar información
  }
}
