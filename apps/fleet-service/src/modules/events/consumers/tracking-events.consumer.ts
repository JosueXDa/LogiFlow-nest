import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repartidor } from '../../repartidor/entities/repartidor.entity';
import { EstadoRepartidor } from '../../../common/enums';

/**
 * Consumidor de eventos del Tracking Service
 */
@Controller()
export class TrackingEventsConsumer {
    private readonly logger = new Logger(TrackingEventsConsumer.name);

    constructor(
        @InjectRepository(Repartidor)
        private readonly repartidorRepo: Repository<Repartidor>,
    ) { }

    /**
     * Evento: ruta.finalizada
     * Acción: Liberar conductor y registrar métricas
     */
    @EventPattern('ruta.finalizada')
    async handleRutaFinalizada(@Payload() data: any) {
        try {
            this.logger.log(
                `📨 Evento recibido: ruta.finalizada - Ruta: ${data.rutaId}, Conductor: ${data.repartidorId}`,
            );

            const eventData = data.data || data;

            // Buscar conductor
            const conductor = await this.repartidorRepo.findOne({
                where: { id: eventData.repartidorId },
            });

            if (!conductor) {
                this.logger.warn(
                    `⚠️ Conductor no encontrado: ${eventData.repartidorId}`,
                );
                return;
            }

            // Actualizar estado a DISPONIBLE
            conductor.estado = EstadoRepartidor.DISPONIBLE;
            await this.repartidorRepo.save(conductor);

            this.logger.log(
                `✅ Conductor ${eventData.repartidorId} liberado - Estado: DISPONIBLE`,
            );

            // Log de métricas
            if (eventData.distanciaRecorridaKm && eventData.duracionMinutos) {
                this.logger.log(
                    `📊 Métricas de ruta ${eventData.rutaId}: ` +
                    `Distancia: ${eventData.distanciaRecorridaKm}km, ` +
                    `Duración: ${eventData.duracionMinutos}min`,
                );
            }
        } catch (error) {
            this.logger.error(
                `❌ Error procesando ruta.finalizada: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Evento: ruta.iniciada
     * Acción: Actualizar estado del conductor a EN_RUTA
     */
    @EventPattern('ruta.iniciada')
    async handleRutaIniciada(@Payload() data: any) {
        try {
            this.logger.log(
                `📨 Evento recibido: ruta.iniciada - Ruta: ${data.rutaId}, Conductor: ${data.repartidorId}`,
            );

            const eventData = data.data || data;

            // Buscar conductor
            const conductor = await this.repartidorRepo.findOne({
                where: { id: eventData.repartidorId },
            });

            if (!conductor) {
                this.logger.warn(
                    `⚠️ Conductor no encontrado: ${eventData.repartidorId}`,
                );
                return;
            }

            // Actualizar estado a OCUPADO
            conductor.estado = EstadoRepartidor.OCUPADO;
            await this.repartidorRepo.save(conductor);

            this.logger.log(
                `✅ Conductor ${eventData.repartidorId} en ruta - Estado: OCUPADO`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Error procesando ruta.iniciada: ${error.message}`,
                error.stack,
            );
        }
    }
}
