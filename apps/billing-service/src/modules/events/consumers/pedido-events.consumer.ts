import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { BillingService } from '../../billing/services/billing.service';
import { BillingEventsProducer } from '../producers/billing-events.producer';
import { PedidoCreadoEvent } from '../dto/pedido-creado.event';
import { PedidoConfirmadoEvent } from '../dto/pedido-confirmado.event';
import { PedidoCanceladoEvent } from '../dto/pedido-cancelado.event';
import { TipoEntrega } from '../../billing/entities/tarifa.entity';
import { TipoVehiculo } from '../../billing/entities/tarifa.entity';

/**
 * Consumidor de eventos relacionados con pedidos
 */
@Controller()
export class PedidoEventsConsumer {
    private readonly logger = new Logger(PedidoEventsConsumer.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly eventsProducer: BillingEventsProducer,
    ) { }

    /**
     * Evento: pedido.creado
     * Acción: Crear factura en estado BORRADOR
     */
    @EventPattern('pedido.creado')
    async handlePedidoCreado(
        @Payload() data: PedidoCreadoEvent,
        @Ctx() context: RmqContext,
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.log(`📨 Evento recibido: pedido.creado - ${data.pedidoId}`);

            // Crear factura en borrador
            // Convertir strings a enums si es necesario
            const tipoEntrega = data.tipoEntrega as TipoEntrega;
            const tipoVehiculo = data.tipoVehiculo as TipoVehiculo;

            const factura = await this.billingService.createFacturaBorrador({
                pedidoId: data.pedidoId,
                clienteId: data.clienteId,
                clienteNombre: data.clienteNombre,
                clienteRuc: data.clienteRuc,
                clienteDireccion: data.clienteDireccion,
                tipoEntrega: tipoEntrega,
                tipoVehiculo: tipoVehiculo,
                distanciaKm: data.distanciaKm,
                pesoKg: data.pesoKg,
                esUrgente: data.esUrgente,
                zonaId: data.zonaId,
                zonaNombre: data.zonaNombre,
            });

            this.logger.log(`✅ Factura borrador creada: ${factura.numeroFactura}`);

            // Emitir evento de factura generada
            await this.eventsProducer.emitirFacturaGenerada({
                facturaId: factura.id,
                pedidoId: factura.pedidoId,
                numeroFactura: factura.numeroFactura,
                total: Number(factura.total),
                estado: factura.estado,
                clienteId: factura.clienteId,
            });

            // ACK manual - mensaje procesado correctamente
            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(
                `❌ Error procesando pedido.creado: ${error.message}`,
                error.stack,
            );

            // NACK con requeue si es error recuperable
            if (this.isRecoverableError(error)) {
                this.logger.warn(`⚠️  Reencolando mensaje (error recuperable)`);
                channel.nack(originalMsg, false, true);
            } else {
                // Enviar a Dead Letter Queue
                this.logger.error(`💀 Enviando a DLQ (error no recuperable)`);
                channel.nack(originalMsg, false, false);
            }
        }
    }

    /**
     * Evento: pedido.confirmado
     * Acción: Emitir factura (cambiar de BORRADOR a EMITIDA)
     */
    @EventPattern('pedido.confirmado')
    async handlePedidoConfirmado(
        @Payload() data: PedidoConfirmadoEvent,
        @Ctx() context: RmqContext,
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.log(`📨 Evento recibido: pedido.confirmado - ${data.pedidoId}`);

            // Buscar factura por pedidoId
            const factura = await this.billingService.findByPedidoId(data.pedidoId);

            // Emitir factura
            await this.billingService.emitirFactura(factura.id);

            this.logger.log(`✅ Factura emitida: ${factura.numeroFactura}`);

            // Emitir evento
            await this.eventsProducer.emitirFacturaEmitida({
                facturaId: factura.id,
                pedidoId: factura.pedidoId,
                numeroFactura: factura.numeroFactura,
                total: Number(factura.total),
                clienteId: factura.clienteId,
            });

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(
                `❌ Error procesando pedido.confirmado: ${error.message}`,
                error.stack,
            );
            channel.nack(originalMsg, false, this.isRecoverableError(error));
        }
    }

    /**
     * Evento: pedido.cancelado
     * Acción: Anular factura
     */
    @EventPattern('pedido.cancelado')
    async handlePedidoCancelado(
        @Payload() data: PedidoCanceladoEvent,
        @Ctx() context: RmqContext,
    ) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();

        try {
            this.logger.log(`📨 Evento recibido: pedido.cancelado - ${data.pedidoId}`);

            const factura = await this.billingService.findByPedidoId(data.pedidoId);

            await this.billingService.anularFactura(
                factura.id,
                `Pedido cancelado: ${data.motivo}`,
            );

            this.logger.log(`✅ Factura anulada: ${factura.numeroFactura}`);

            await this.eventsProducer.emitirFacturaAnulada({
                facturaId: factura.id,
                pedidoId: factura.pedidoId,
                numeroFactura: factura.numeroFactura,
                motivo: data.motivo,
            });

            channel.ack(originalMsg);
        } catch (error) {
            this.logger.error(
                `❌ Error procesando pedido.cancelado: ${error.message}`,
                error.stack,
            );
            channel.nack(originalMsg, false, this.isRecoverableError(error));
        }
    }

    /**
     * Determinar si un error es recuperable
     */
    private isRecoverableError(error: any): boolean {
        const recoverableErrors = [
            'ECONNREFUSED',
            'ETIMEDOUT',
            'ENOTFOUND',
            'DatabaseError',
            'QueryFailedError',
            'Connection',
        ];

        return recoverableErrors.some(
            (err) =>
                error.message?.includes(err) ||
                error.code?.includes(err) ||
                error.name?.includes(err),
        );
    }
}
