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
  constructor(private readonly flotaService: FlotaService) {}

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
}
