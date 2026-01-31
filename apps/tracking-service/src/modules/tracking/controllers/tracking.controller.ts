import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TrackingService } from '../services/tracking.service';
import { TrackingEventsProducer } from '../producers/tracking-events.producer';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { IniciarRutaDto } from '../dto/iniciar-ruta.dto';
import { HistorialQueryDto } from '../dto/historial-query.dto';

@Controller()
export class TrackingController {
    private readonly logger = new Logger(TrackingController.name);

    constructor(
        private readonly trackingService: TrackingService,
        private readonly eventsProducer: TrackingEventsProducer,
    ) { }

    /**
     * Actualizar ubicación GPS
     */
    @MessagePattern({ cmd: 'tracking.actualizar_ubicacion' })
    async updateLocation(@Payload() dto: UpdateLocationDto) {
        this.logger.log(`📍 Recibido: actualizar ubicación - ${dto.repartidorId}`);

        const ubicacion = await this.trackingService.saveLocation(dto);

        // Emitir evento
        await this.eventsProducer.emitirUbicacionActualizada({
            repartidorId: ubicacion.repartidorId,
            pedidoId: ubicacion.pedidoId,
            latitud: Number(ubicacion.latitud),
            longitud: Number(ubicacion.longitud),
            velocidadKmh: ubicacion.velocidadKmh ? Number(ubicacion.velocidadKmh) : null,
            precision: ubicacion.precision ? Number(ubicacion.precision) : null,
            timestamp: ubicacion.timestamp,
        });

        return ubicacion;
    }

    /**
     * Obtener última ubicación
     */
    @MessagePattern({ cmd: 'tracking.obtener_ultima_ubicacion' })
    async getUltimaUbicacion(@Payload() repartidorId: string) {
        this.logger.log(`🔍 Consulta: última ubicación - ${repartidorId}`);
        return await this.trackingService.getUltimaUbicacion(repartidorId);
    }

    /**
     * Obtener historial de ubicaciones
     */
    @MessagePattern({ cmd: 'tracking.obtener_historial' })
    async getHistorial(@Payload() query: HistorialQueryDto) {
        this.logger.log(`🔍 Consulta: historial - ${query.repartidorId}`);
        return await this.trackingService.getHistorial(
            query.repartidorId,
            query.fechaDesde,
            query.fechaHasta,
            query.limit,
        );
    }

    /**
     * Obtener ruta activa
     */
    @MessagePattern({ cmd: 'tracking.obtener_ruta_activa' })
    async getRutaActiva(@Payload() repartidorId: string) {
        this.logger.log(`🔍 Consulta: ruta activa - ${repartidorId}`);
        return await this.trackingService.getRutaActiva(repartidorId);
    }

    /**
     * Iniciar ruta
     */
    @MessagePattern({ cmd: 'tracking.iniciar_ruta' })
    async iniciarRuta(@Payload() dto: IniciarRutaDto) {
        this.logger.log(`🚀 Iniciar ruta para pedido ${dto.pedidoId}`);

        const ruta = await this.trackingService.iniciarRuta(dto);

        // Emitir evento
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

        return ruta;
    }

    /**
     * Finalizar ruta
     */
    @MessagePattern({ cmd: 'tracking.finalizar_ruta' })
    async finalizarRuta(@Payload() rutaId: string) {
        this.logger.log(`✅ Finalizar ruta ${rutaId}`);

        const ruta = await this.trackingService.finalizarRuta(rutaId);

        // Emitir evento
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

        return ruta;
    }

    /**
     * Cancelar ruta
     */
    @MessagePattern({ cmd: 'tracking.cancelar_ruta' })
    async cancelarRuta(@Payload() rutaId: string) {
        this.logger.log(`❌ Cancelar ruta ${rutaId}`);
        return await this.trackingService.cancelarRuta(rutaId);
    }

    /**
     * Obtener ruta por ID
     */
    @MessagePattern({ cmd: 'tracking.obtener_ruta' })
    async getRutaById(@Payload() rutaId: string) {
        this.logger.log(`🔍 Consulta: ruta ${rutaId}`);
        return await this.trackingService.getRutaById(rutaId);
    }
}
