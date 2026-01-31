import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PEDIDOS_SERVICE } from './service/pedidos-service.interface';
import type { IPedidosService } from './service/pedidos-service.interface';

@Controller()
export class PedidosEventsController {
  constructor(
    @Inject(PEDIDOS_SERVICE)
    private readonly pedidosService: IPedidosService,
  ) { }

  @EventPattern('conductor.asignado')
  async onConductorAsignado(
    @Payload()
    payload: {
      pedidoId: string;
      conductorId: string; // Puede venir como conductorId o repartidorId, haremos mapping
      repartidorId?: string;
      placaVehiculo: string;
      tiempoEstimadoLlegada: number;
    },
  ) {
    await this.pedidosService.handleConductorAsignado({
      pedidoId: payload.pedidoId,
      conductorId: payload.conductorId || payload.repartidorId || '',
    });
  }

  @EventPattern('fleet.asignacion.failed')
  async onAsignacionFallida(
    @Payload()
    payload: {
      pedidoId: string;
      razon: string;
    },
  ) {
    await this.pedidosService.handleAsignacionFallida(payload);
  }

  @EventPattern('entrega.completada')
  async onEntregaCompletada(
    @Payload()
    payload: {
      pedidoId: string;
      fecha: Date;
    },
  ) {
    await this.pedidosService.handleEntregaCompletada(payload);
  }
}
