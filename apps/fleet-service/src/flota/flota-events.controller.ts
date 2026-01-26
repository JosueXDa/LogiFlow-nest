import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { FlotaService } from './flota.service';
import { TipoVehiculo } from './entities';

/**
 * Controlador para comunicación asíncrona via RabbitMQ
 * Escucha eventos de otros microservicios y responde según la lógica de negocio
 */
@Controller()
export class FlotaEventsController {
  constructor(private readonly flotaService: FlotaService) { }

  /**
   * Escucha el evento 'pedido.creado' emitido por pedidos-service
   * Ejecuta la lógica de asignación inteligente de conductor
   */
  @EventPattern('pedido.creado')
  async onPedidoCreado(
    @Payload()
    payload: {
      id: string;
      origen: { latitud: number; longitud: number };
      tipoVehiculo: TipoVehiculo;
      pesoKg?: number;
    },
  ) {
    const pesoKg = payload.pesoKg || 10; // Peso por defecto si no se especifica

    await this.flotaService.asignarConductorAPedido({
      pedidoId: payload.id,
      origen: payload.origen,
      tipoVehiculo: payload.tipoVehiculo,
      pesoKg,
    });
  }

  /**
   * Escucha el evento 'pedido.entregado' para liberar al conductor
   */
  @EventPattern('pedido.entregado')
  async onPedidoEntregado(
    @Payload()
    payload: {
      pedidoId: string;
      conductorId: string;
    },
  ) {
    if (payload.conductorId) {
      await this.flotaService.liberarConductor(payload.conductorId);
    }
  }

  /**
   * Escucha el evento 'pedido.cancelado' para liberar al conductor
   */
  @EventPattern('pedido.cancelado')
  async onPedidoCancelado(
    @Payload()
    payload: {
      id: string;
      repartidorId?: string;
    },
  ) {
    if (payload.repartidorId) {
      await this.flotaService.liberarConductor(payload.repartidorId);
    }
  }

  /**
   * Escucha el evento 'stock.insuficiente' de Inventory
   * Registra el problema para análisis y posible re-asignación
   */
  @EventPattern('stock.insuficiente')
  async onStockInsuficiente(
    @Payload()
    payload: {
      pedidoId: string;
      productoId: string;
      productoSku: string;
      cantidadSolicitada: number;
      stockDisponible: number;
    },
  ) {
    // Lógica: registrar evento para análisis
    // Podría notificar al conductor que el pedido tiene problemas
    console.log(
      `⚠️ Stock insuficiente para pedido ${payload.pedidoId} - Producto: ${payload.productoSku}`,
    );
    console.log(
      `   Solicitado: ${payload.cantidadSolicitada}, Disponible: ${payload.stockDisponible}`,
    );
  }

  /**
   * Escucha el evento 'stock.reservado' de Inventory
   * Confirma que el pedido tiene stock y puede proceder
   */
  @EventPattern('stock.reservado')
  async onStockReservado(
    @Payload()
    payload: {
      reservaId: string;
      pedidoId: string;
      productoId: string;
      productoSku: string;
      cantidad: number;
    },
  ) {
    // Lógica: confirmar que el pedido está listo para asignación
    console.log(
      `✅ Stock reservado para pedido ${payload.pedidoId} - Producto: ${payload.productoSku} (${payload.cantidad} unidades)`,
    );
  }
}
