import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { BillingService } from '../../billing/services/billing.service';
import { BillingEventsProducer } from '../producers/billing-events.producer';

@Controller()
export class EntregaEventsConsumer {
    private readonly logger = new Logger(EntregaEventsConsumer.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly eventsProducer: BillingEventsProducer,
    ) { }

    /**
     * Evento: entrega.completada
     * Acción: Marcar factura como lista para pago (opcional)
     */
    @EventPattern('entrega.completada')
    async handleEntregaCompletada(
        @Payload() data: any,
        @Ctx() context: RmqContext,
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.log(
                `📨 Evento recibido: entrega.completada - ${data.pedidoId}`,
            );

            // Lógica adicional si es necesaria
            // Por ejemplo: notificar que la factura está lista para cobro

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(
                `❌ Error procesando entrega.completada: ${error.message}`,
                error.stack,
            );
            channel.nack(originalMsg, false, true);
        }
    }
}
