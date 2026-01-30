import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FLEET_EVENT_CLIENT } from '../constants';

@Injectable()
export class FleetEventPublisher {
    private readonly logger = new Logger(FleetEventPublisher.name);

    constructor(
        @Inject(FLEET_EVENT_CLIENT)
        private readonly client: ClientProxy,
    ) { }

    async publishRepartidorCreated(data: any): Promise<void> {
        const event = {
            eventName: 'fleet.repartidor.created',
            timestamp: new Date().toISOString(),
            data,
        };

        this.client.emit('fleet.repartidor.created', event);
        this.logger.log(
            `Evento publicado: fleet.repartidor.created - ${data.repartidorId}`,
        );
    }

    async publishEstadoChanged(data: any): Promise<void> {
        const event = {
            eventName: 'fleet.repartidor.estado.changed',
            timestamp: new Date().toISOString(),
            data,
        };
        this.client.emit('fleet.repartidor.estado.changed', event);
        this.logger.log(`Evento publicado: fleet.repartidor.estado.changed - ${data.repartidorId}`);
    }

    async publishAsignacionCreated(data: any): Promise<void> {
        const event = {
            eventName: 'fleet.asignacion.created',
            timestamp: new Date().toISOString(),
            data,
        };

        this.client.emit('fleet.asignacion.created', event);
        this.logger.log(
            `Evento publicado: fleet.asignacion.created - ${data.asignacionId}`,
        );
    }

    async publishEntregaCompletada(data: any): Promise<void> {
        const event = {
            pattern: 'entrega.completada',
            data: {
                ...data,
                timestamp: new Date().toISOString(),
            }
        };

        // Emitir al exchange logiflow.events con routing key 'entrega.completada'
        this.client.emit('entrega.completada', event.data);
        this.logger.log(`Evento publicado: entrega.completada - Pedido: ${data.pedidoId}`);
    }
}
