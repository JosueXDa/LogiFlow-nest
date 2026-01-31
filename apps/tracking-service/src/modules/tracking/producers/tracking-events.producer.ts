import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UbicacionActualizadaEvent } from '../events/ubicacion-actualizada.event';
import { RutaIniciadaEvent } from '../events/ruta-iniciada.event';
import { RutaFinalizadaEvent } from '../events/ruta-finalizada.event';

@Injectable()
export class TrackingEventsProducer {
    private readonly logger = new Logger(TrackingEventsProducer.name);

    constructor(
        @Inject('EVENTS_SERVICE')
        private readonly eventsClient: ClientProxy,
    ) { }

    /**
     * Emitir evento de ubicación actualizada
     */
    async emitirUbicacionActualizada(event: UbicacionActualizadaEvent): Promise<void> {
        try {
            this.eventsClient.emit('repartidor.ubicacion.actualizada', {
                eventName: 'repartidor.ubicacion.actualizada',
                timestamp: new Date().toISOString(),
                data: event,
            });

            this.logger.log(
                `📡 Evento emitido: repartidor.ubicacion.actualizada - ${event.repartidorId}`,
            );
        } catch (error) {
            this.logger.error(
                `Error emitiendo evento ubicacion.actualizada: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Emitir evento de ruta iniciada
     */
    async emitirRutaIniciada(event: RutaIniciadaEvent): Promise<void> {
        try {
            this.eventsClient.emit('ruta.iniciada', {
                eventName: 'ruta.iniciada',
                timestamp: new Date().toISOString(),
                data: event,
            });

            this.logger.log(`📡 Evento emitido: ruta.iniciada - ${event.rutaId}`);
        } catch (error) {
            this.logger.error(
                `Error emitiendo evento ruta.iniciada: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Emitir evento de ruta finalizada
     */
    async emitirRutaFinalizada(event: RutaFinalizadaEvent): Promise<void> {
        try {
            this.eventsClient.emit('ruta.finalizada', {
                eventName: 'ruta.finalizada',
                timestamp: new Date().toISOString(),
                data: event,
            });

            this.logger.log(`📡 Evento emitido: ruta.finalizada - ${event.rutaId}`);
        } catch (error) {
            this.logger.error(
                `Error emitiendo evento ruta.finalizada: ${error.message}`,
                error.stack,
            );
        }
    }
}
