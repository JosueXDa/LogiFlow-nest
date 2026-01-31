import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../entities/pedido.entity';
import { PedidoEstado } from '../entities/pedido.entity';

/**
 * Consumidor de eventos del Tracking Service
 */
@Controller()
export class TrackingEventsConsumer {
    private readonly logger = new Logger(TrackingEventsConsumer.name);

    constructor(
        @InjectRepository(Pedido)
        private readonly pedidoRepo: Repository<Pedido>,
    ) { }

    /**
     * Evento: ruta.finalizada
     * Acción: Actualizar estado del pedido a ENTREGADO
     */
    @EventPattern('ruta.finalizada')
    async handleRutaFinalizada(@Payload() data: any) {
        try {
            this.logger.log(
                `📨 Evento recibido: ruta.finalizada - Pedido: ${data.pedidoId}`,
            );

            const eventData = data.data || data;

            // Buscar pedido
            const pedido = await this.pedidoRepo.findOne({
                where: { id: eventData.pedidoId },
            });

            if (!pedido) {
                this.logger.warn(`⚠️ Pedido no encontrado: ${eventData.pedidoId}`);
                return;
            }

            // Actualizar estado a ENTREGADO
            pedido.estado = PedidoEstado.ENTREGADO;

            await this.pedidoRepo.save(pedido);

            this.logger.log(
                `✅ Pedido ${eventData.pedidoId} actualizado a ENTREGADO`,
            );

            // Log de métricas de entrega
            if (eventData.distanciaRecorridaKm && eventData.duracionMinutos) {
                this.logger.log(
                    `📊 Métricas de entrega - Pedido ${eventData.pedidoId}: ` +
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
     * Acción: Actualizar estado del pedido a EN_RUTA
     */
    @EventPattern('ruta.iniciada')
    async handleRutaIniciada(@Payload() data: any) {
        try {
            this.logger.log(
                `📨 Evento recibido: ruta.iniciada - Pedido: ${data.pedidoId}`,
            );

            const eventData = data.data || data;

            // Buscar pedido
            const pedido = await this.pedidoRepo.findOne({
                where: { id: eventData.pedidoId },
            });

            if (!pedido) {
                this.logger.warn(`⚠️ Pedido no encontrado: ${eventData.pedidoId}`);
                return;
            }

            // Actualizar estado a EN_RUTA
            pedido.estado = PedidoEstado.EN_RUTA;
            await this.pedidoRepo.save(pedido);

            this.logger.log(
                `✅ Pedido ${eventData.pedidoId} actualizado a EN_RUTA`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Error procesando ruta.iniciada: ${error.message}`,
                error.stack,
            );
        }
    }
}
