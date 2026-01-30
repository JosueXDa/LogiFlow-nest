import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AsignacionService } from './service/asignacion.service';

@Controller()
export class AsignacionEventsController {
    private readonly logger = new Logger(AsignacionEventsController.name);

    constructor(private readonly asignacionService: AsignacionService) { }

    @EventPattern('pedido.created')
    async handlePedidoCreated(@Payload() payload: any) {
        this.logger.log(`Evento recibido: pedido.created - ${JSON.stringify(payload)}`);

        // Asumiendo que el payload viene con { data: { ...dto } } o directamente el dto.
        // Ajustar segun contrato de PedidoService.
        // Doc dice: Payload: { eventName: 'pedido.created', data: { ... } }

        const dto = payload.data;

        try {
            await this.asignacionService.asignarPedido({
                pedidoId: dto.pedidoId,
                tipoEntrega: dto.tipoEntrega,
                pesoKg: dto.pesoKg,
                volumenM3: dto.volumenM3,
                zonaId: dto.zonaId,
                origenLat: dto.origenLat,
                origenLng: dto.origenLng,
                destinoLat: dto.destinoLat,
                destinoLng: dto.destinoLng
            });
            this.logger.log(`Pedido ${dto.pedidoId} asignado automáticamente`);
        } catch (error) {
            this.logger.error(`Error asignando pedido ${dto.pedidoId}: ${error.message}`);
            // Aqui se podria publicar un evento de 'fleet.asignacion.failed'
        }
    }
}
