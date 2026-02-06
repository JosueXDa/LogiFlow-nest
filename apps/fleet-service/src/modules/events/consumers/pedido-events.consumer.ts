import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AsignacionService } from '../../asignacion/service/asignacion.service';
import { TipoEntrega } from '../../../common/enums';

/**
 * Consumer de eventos de Pedidos Service
 * Escucha evento 'pedido.creado' para asignar automáticamente repartidores
 */
@Controller()
export class PedidoEventsConsumer {
    private readonly logger = new Logger(PedidoEventsConsumer.name);

    constructor(
        private readonly asignacionService: AsignacionService,
    ) {
        this.logger.log('🎯 PedidoEventsConsumer inicializado - Esperando eventos de pedidos...');
    }

    /**
     * Evento: pedido.creado
     * Acción: Asignar automáticamente un repartidor disponible
     */
    @EventPattern('pedido.creado')
    async handlePedidoCreado(@Payload() data: any) {
        try {
            this.logger.log(`📨 Evento recibido: pedido.creado - Pedido: ${data.pedidoId}`);
            this.logger.debug(`📦 Payload: ${JSON.stringify(data)}`);

            // Mapear tipoEntrega del evento al enum
            const tipoEntregaMap: Record<string, TipoEntrega> = {
                'URBANA': TipoEntrega.URBANA,
                'INTERMUNICIPAL': TipoEntrega.INTERMUNICIPAL,
                'NACIONAL': TipoEntrega.NACIONAL,
            };

            const tipoEntrega = tipoEntregaMap[data.tipoEntrega] || TipoEntrega.URBANA;

            // TODO: Determinar zonaId basado en coordenadas (geocodificación)
            // Por ahora es null - buscar repartidores sin filtro de zona
            const zonaId = data.zonaId || null;

            // Crear DTO para asignación
            const asignacionDto = {
                pedidoId: data.pedidoId,
                tipoEntrega,
                zonaId,
                pesoKg: data.pesoKg || 0,
                volumenM3: data.volumenM3 || 0, // No viene en evento, usar 0
                origenLat: data.origenLat || 0,
                origenLng: data.origenLng || 0,
                destinoLat: data.destinoLat || 0,
                destinoLng: data.destinoLng || 0,
            };

            this.logger.log(`🔍 Buscando repartidor disponible para pedido ${data.pedidoId}...`);
            this.logger.debug(`📍 Tipo: ${tipoEntrega}, Zona: ${zonaId}, Peso: ${data.pesoKg}kg`);

            // Intentar asignar repartidor
            const asignacion = await this.asignacionService.asignarPedido(asignacionDto);

            this.logger.log(
                `✅ Repartidor ${asignacion.repartidorId} asignado al pedido ${data.pedidoId}` +
                ` - Tiempo estimado: ${asignacion.tiempoEstimadoMin} min`
            );

        } catch (error) {
            this.logger.error(
                `❌ Error asignando repartidor para pedido ${data.pedidoId}: ${error.message}`,
                error.stack,
            );

            // TODO: Emitir evento de asignación fallida
            // await this.eventPublisher.publishAsignacionFailed({
            //     pedidoId: data.pedidoId,
            //     razon: error.message
            // });
        }
    }

    /**
     * Evento: pedido.cancelado
     * Acción: Liberar repartidor asignado si existe
     */
    @EventPattern('pedido.cancelado')
    async handlePedidoCancelado(@Payload() data: any) {
        try {
            this.logger.log(`📨 Evento recibido: pedido.cancelado - Pedido: ${data.pedidoId}`);
            
            // TODO: Implementar lógica de cancelación
            // - Buscar asignación por pedidoId
            // - Cambiar estado a CANCELADA
            // - Liberar repartidor (cambiar estado a DISPONIBLE)
            // - Emitir evento asignacion.cancelada

            this.logger.warn(`⚠️  Manejo de pedido.cancelado pendiente de implementar`);
        } catch (error) {
            this.logger.error(
                `❌ Error procesando pedido.cancelado: ${error.message}`,
                error.stack,
            );
        }
    }
}
