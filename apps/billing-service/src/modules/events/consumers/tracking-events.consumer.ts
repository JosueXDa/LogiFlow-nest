import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

/**
 * Consumidor de eventos del Tracking Service
 */
@Controller()
export class TrackingEventsConsumer {
    private readonly logger = new Logger(TrackingEventsConsumer.name);

    /**
     * Evento: ruta.finalizada
     * Acción: Actualizar distancia real y recalcular tarifa si es necesario
     */
    @EventPattern('ruta.finalizada')
    async handleRutaFinalizada(@Payload() data: any) {
        try {
            this.logger.log(
                `📨 Evento recibido: ruta.finalizada - Pedido: ${data.pedidoId}`,
            );

            const eventData = data.data || data;

            if (!eventData.distanciaRecorridaKm) {
                this.logger.warn(
                    `⚠️ Evento sin distancia recorrida para pedido ${eventData.pedidoId}`,
                );
                return;
            }

            this.logger.log(
                `📊 Distancia real del pedido ${eventData.pedidoId}: ${eventData.distanciaRecorridaKm}km, ` +
                `Duración: ${eventData.duracionMinutos}min`,
            );

            // Nota: El Billing Service ya tiene la lógica para calcular tarifas
            // Este consumidor solo registra la información para futuras mejoras
            // como recalcular tarifas basadas en distancia real vs estimada

            this.logger.log(
                `✅ Métricas de ruta registradas para pedido ${eventData.pedidoId}`,
            );
        } catch (error) {
            this.logger.error(
                `❌ Error procesando ruta.finalizada: ${error.message}`,
                error.stack,
            );
        }
    }
}
