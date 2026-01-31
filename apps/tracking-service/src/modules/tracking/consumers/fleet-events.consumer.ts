import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TrackingService } from '../services/tracking.service';
import { TrackingEventsProducer } from '../producers/tracking-events.producer';

/**
 * Consumidor de eventos del Fleet Service
 */
@Controller()
export class FleetEventsConsumer {
    private readonly logger = new Logger(FleetEventsConsumer.name);

    constructor(
        private readonly trackingService: TrackingService,
        private readonly eventsProducer: TrackingEventsProducer,
    ) { }

    /**
     * Evento: conductor.asignado
     * Acción: Iniciar ruta automáticamente
     */
    @EventPattern('conductor.asignado')
    async handleConductorAsignado(@Payload() data: any) {
        try {
            this.logger.log(
                `📨 Evento recibido: conductor.asignado - Pedido: ${data.pedidoId}, Conductor: ${data.conductorId}`,
            );

            // Verificar que no haya ruta activa
            const rutaActiva = await this.trackingService.getRutaActiva(
                data.conductorId,
            );

            if (rutaActiva) {
                this.logger.warn(
                    `⚠️ Conductor ${data.conductorId} ya tiene ruta activa: ${rutaActiva.id}`,
                );
                return;
            }

            // Iniciar ruta automáticamente
            const ruta = await this.trackingService.iniciarRuta({
                pedidoId: data.pedidoId,
                repartidorId: data.conductorId,
                origenLat: data.origenLat || data.origen?.latitud,
                origenLng: data.origenLng || data.origen?.longitud,
                origenDireccion: data.origenDireccion || data.origen?.direccion,
                destinoLat: data.destinoLat || data.destino?.latitud,
                destinoLng: data.destinoLng || data.destino?.longitud,
                destinoDireccion: data.destinoDireccion || data.destino?.direccion,
            });

            // Emitir evento de ruta iniciada
            await this.eventsProducer.emitirRutaIniciada({
                rutaId: ruta.id,
                pedidoId: ruta.pedidoId,
                repartidorId: ruta.repartidorId,
                origenLat: Number(ruta.origenLat),
                origenLng: Number(ruta.origenLng),
                destinoLat: Number(ruta.destinoLat),
                destinoLng: Number(ruta.destinoLng),
                timestamp: ruta.fechaInicio,
            });

            this.logger.log(
                `✅ Ruta iniciada automáticamente: ${ruta.id} para pedido ${data.pedidoId}`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Error procesando conductor.asignado: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Evento: entrega.completada
     * Acción: Finalizar ruta automáticamente
     */
    @EventPattern('entrega.completada')
    async handleEntregaCompletada(@Payload() data: any) {
        try {
            this.logger.log(
                `📨 Evento recibido: entrega.completada - Pedido: ${data.pedidoId}`,
            );

            // Buscar ruta activa del conductor
            const rutaActiva = await this.trackingService.getRutaActiva(
                data.conductorId || data.repartidorId,
            );

            if (!rutaActiva) {
                this.logger.warn(
                    `⚠️ No se encontró ruta activa para conductor ${data.conductorId || data.repartidorId}`,
                );
                return;
            }

            // Finalizar ruta
            const ruta = await this.trackingService.finalizarRuta(rutaActiva.id);

            // Emitir evento de ruta finalizada
            await this.eventsProducer.emitirRutaFinalizada({
                rutaId: ruta.id,
                pedidoId: ruta.pedidoId,
                repartidorId: ruta.repartidorId,
                distanciaRecorridaKm: ruta.distanciaRecorridaKm
                    ? Number(ruta.distanciaRecorridaKm)
                    : null,
                duracionMinutos: ruta.duracionMinutos,
                timestamp: ruta.fechaFin || new Date(),
            });

            this.logger.log(
                `✅ Ruta finalizada automáticamente: ${ruta.id} - Distancia: ${ruta.distanciaRecorridaKm}km, Duración: ${ruta.duracionMinutos}min`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Error procesando entrega.completada: ${error.message}`,
                error.stack,
            );
        }
    }
}
