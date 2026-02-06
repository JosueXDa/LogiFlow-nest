import { Controller, Inject, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PEDIDOS_SERVICE } from '../service/pedidos-service.interface';
import type { IPedidosService } from '../service/pedidos-service.interface';

/**
 * Consumidor de eventos del Billing Service
 */
@Controller()
export class BillingEventsConsumer {
    private readonly logger = new Logger(BillingEventsConsumer.name);

    constructor(
        @Inject(PEDIDOS_SERVICE)
        private readonly pedidosService: IPedidosService,
    ) {
        this.logger.log('🎯 BillingEventsConsumer inicializado - Esperando eventos de facturación...');
    }

    /**
     * Evento: factura.generada
     * Acción: Registrar que la factura borrador fue creada
     */
    @EventPattern('factura.generada')
    async handleFacturaGenerada(@Payload() data: any) {
        try {
            this.logger.log(`📨 Evento recibido: factura.generada - Pedido: ${data.pedidoId}, Factura: ${data.numeroFactura}`);
            // Solo logging - la factura está en estado BORRADOR
        } catch (error) {
            this.logger.error(
                `❌ Error procesando factura.generada: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Evento: factura.emitida
     * Acción: Actualizar precioTotal del pedido
     */
    @EventPattern('factura.emitida')
    async handleFacturaEmitida(@Payload() data: any) {
        try {
            this.logger.log(`📨 Evento recibido: factura.emitida - Pedido: ${data.pedidoId}, Total: ${data.total}`);

            // Actualizar precioTotal del pedido
            await this.pedidosService.updatePrecioTotal(data.pedidoId, data.total);

            this.logger.log(`✅ Pedido ${data.pedidoId} actualizado con precio total: $${data.total}`);
        } catch (error) {
            this.logger.error(
                `❌ Error procesando factura.emitida: ${error.message}`,
                error.stack,
            );
        }
    }

    /**
     * Evento: factura.anulada
     * Acción: Podría revertir el pedido o notificar
     */
    @EventPattern('factura.anulada')
    async handleFacturaAnulada(@Payload() data: any) {
        try {
            this.logger.log(`📨 Evento recibido: factura.anulada - Pedido: ${data.pedidoId}`);
            this.logger.warn(`⚠️ Factura anulada para pedido ${data.pedidoId}. Motivo: ${data.motivo}`);
            
            // Aquí podría agregarse lógica para manejar facturas anuladas
            // Por ejemplo: notificar al cliente, revertir estado, etc.
        } catch (error) {
            this.logger.error(
                `❌ Error procesando factura.anulada: ${error.message}`,
                error.stack,
            );
        }
    }
}
