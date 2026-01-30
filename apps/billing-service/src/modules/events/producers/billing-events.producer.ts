import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
    FacturaGeneradaEvent,
    FacturaEmitidaEvent,
    FacturaPagadaEvent,
    FacturaAnuladaEvent,
} from '../dto/factura-events.dto';

@Injectable()
export class BillingEventsProducer {
    private readonly logger = new Logger(BillingEventsProducer.name);

    constructor(
        @Inject('EVENTS_SERVICE')
        private readonly client: ClientProxy,
    ) { }

    /**
     * Emitir evento: factura.generada
     */
    async emitirFacturaGenerada(data: FacturaGeneradaEvent) {
        const event = {
            ...data,
            timestamp: new Date().toISOString(),
            eventId: this.generateEventId(),
        };

        this.logger.log(`📤 Emitiendo evento: factura.generada - ${data.numeroFactura}`);

        return this.client.emit('factura.generada', event);
    }

    /**
     * Emitir evento: factura.emitida
     */
    async emitirFacturaEmitida(data: FacturaEmitidaEvent) {
        const event = {
            ...data,
            timestamp: new Date().toISOString(),
            eventId: this.generateEventId(),
        };

        this.logger.log(`📤 Emitiendo evento: factura.emitida - ${data.numeroFactura}`);

        return this.client.emit('factura.emitida', event);
    }

    /**
     * Emitir evento: factura.pagada
     */
    async emitirFacturaPagada(data: FacturaPagadaEvent) {
        const event = {
            ...data,
            timestamp: new Date().toISOString(),
            eventId: this.generateEventId(),
        };

        this.logger.log(`📤 Emitiendo evento: factura.pagada - ${data.numeroFactura}`);

        return this.client.emit('factura.pagada', event);
    }

    /**
     * Emitir evento: factura.anulada
     */
    async emitirFacturaAnulada(data: FacturaAnuladaEvent) {
        const event = {
            ...data,
            timestamp: new Date().toISOString(),
            eventId: this.generateEventId(),
        };

        this.logger.log(`📤 Emitiendo evento: factura.anulada - ${data.numeroFactura}`);

        return this.client.emit('factura.anulada', event);
    }

    /**
     * Generar ID único para el evento
     */
    private generateEventId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
