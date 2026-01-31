import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ubicacion } from '../entities/ubicacion.entity';
import { Ruta } from '../entities/ruta.entity';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { IniciarRutaDto } from '../dto/iniciar-ruta.dto';
import { EstadoRuta } from '../tracking.constants';

@Injectable()
export class TrackingService {
    private readonly logger = new Logger(TrackingService.name);

    constructor(
        @InjectRepository(Ubicacion)
        private readonly ubicacionRepo: Repository<Ubicacion>,
        @InjectRepository(Ruta)
        private readonly rutaRepo: Repository<Ruta>,
    ) { }

    /**
     * Guardar ubicación GPS
     */
    async saveLocation(dto: UpdateLocationDto): Promise<Ubicacion> {
        const ubicacion = this.ubicacionRepo.create({
            repartidorId: dto.repartidorId,
            pedidoId: dto.pedidoId,
            latitud: dto.latitud,
            longitud: dto.longitud,
            velocidadKmh: dto.velocidadKmh,
            precision: dto.precision,
            altitud: dto.altitud,
            rumbo: dto.rumbo,
            dispositivoId: dto.dispositivoId,
            tipoConexion: dto.tipoConexion,
        });

        // Asociar con ruta activa si existe
        const rutaActiva = await this.getRutaActiva(dto.repartidorId);
        if (rutaActiva) {
            ubicacion.rutaId = rutaActiva.id;

            // Actualizar distancia recorrida
            await this.actualizarDistanciaRuta(rutaActiva.id);
        }

        const savedUbicacion = await this.ubicacionRepo.save(ubicacion);
        this.logger.log(`📍 Ubicación guardada para repartidor ${dto.repartidorId}`);

        return savedUbicacion;
    }

    /**
     * Obtener última ubicación del repartidor
     */
    async getUltimaUbicacion(repartidorId: string): Promise<Ubicacion | null> {
        return await this.ubicacionRepo.findOne({
            where: { repartidorId },
            order: { timestamp: 'DESC' },
        });
    }

    /**
     * Obtener historial de ubicaciones
     */
    async getHistorial(
        repartidorId: string,
        fechaDesde?: Date,
        fechaHasta?: Date,
        limit: number = 100,
    ): Promise<Ubicacion[]> {
        const query = this.ubicacionRepo
            .createQueryBuilder('ubicacion')
            .where('ubicacion.repartidorId = :repartidorId', { repartidorId })
            .orderBy('ubicacion.timestamp', 'DESC')
            .limit(limit);

        if (fechaDesde) {
            query.andWhere('ubicacion.timestamp >= :fechaDesde', { fechaDesde });
        }

        if (fechaHasta) {
            query.andWhere('ubicacion.timestamp <= :fechaHasta', { fechaHasta });
        }

        return await query.getMany();
    }

    /**
     * Iniciar tracking de ruta
     */
    async iniciarRuta(dto: IniciarRutaDto): Promise<Ruta> {
        // Verificar que no haya ruta activa
        const rutaActiva = await this.getRutaActiva(dto.repartidorId);
        if (rutaActiva) {
            throw new BadRequestException(
                `El repartidor ${dto.repartidorId} ya tiene una ruta activa`,
            );
        }

        const distanciaEsperada = this.calcularDistanciaHaversine(
            dto.origenLat,
            dto.origenLng,
            dto.destinoLat,
            dto.destinoLng,
        );

        const ruta = this.rutaRepo.create({
            pedidoId: dto.pedidoId,
            repartidorId: dto.repartidorId,
            origenLat: dto.origenLat,
            origenLng: dto.origenLng,
            origenDireccion: dto.origenDireccion,
            destinoLat: dto.destinoLat,
            destinoLng: dto.destinoLng,
            destinoDireccion: dto.destinoDireccion,
            estado: EstadoRuta.EN_CURSO,
            distanciaEsperadaKm: distanciaEsperada,
        });

        const savedRuta = await this.rutaRepo.save(ruta);
        this.logger.log(`🚀 Ruta iniciada: ${savedRuta.id} para pedido ${dto.pedidoId}`);

        return savedRuta;
    }

    /**
     * Finalizar ruta
     */
    async finalizarRuta(rutaId: string): Promise<Ruta> {
        const ruta = await this.rutaRepo.findOne({ where: { id: rutaId } });
        if (!ruta) {
            throw new NotFoundException(`Ruta ${rutaId} no encontrada`);
        }

        if (ruta.estado !== EstadoRuta.EN_CURSO) {
            throw new BadRequestException(
                `La ruta ${rutaId} no está en curso (estado: ${ruta.estado})`,
            );
        }

        // Calcular duración
        const duracionMs = new Date().getTime() - ruta.fechaInicio.getTime();
        ruta.duracionMinutos = Math.round(duracionMs / 60000);

        ruta.estado = EstadoRuta.COMPLETADA;
        ruta.fechaFin = new Date();

        const savedRuta = await this.rutaRepo.save(ruta);
        this.logger.log(
            `✅ Ruta finalizada: ${rutaId} - Duración: ${ruta.duracionMinutos} min`,
        );

        return savedRuta;
    }

    /**
     * Cancelar ruta
     */
    async cancelarRuta(rutaId: string): Promise<Ruta> {
        const ruta = await this.rutaRepo.findOne({ where: { id: rutaId } });
        if (!ruta) {
            throw new NotFoundException(`Ruta ${rutaId} no encontrada`);
        }

        ruta.estado = EstadoRuta.CANCELADA;
        ruta.fechaFin = new Date();

        return await this.rutaRepo.save(ruta);
    }

    /**
     * Obtener ruta activa del repartidor
     */
    async getRutaActiva(repartidorId: string): Promise<Ruta | null> {
        return await this.rutaRepo.findOne({
            where: {
                repartidorId,
                estado: EstadoRuta.EN_CURSO,
            },
        });
    }

    /**
     * Obtener ruta por ID
     */
    async getRutaById(rutaId: string): Promise<Ruta> {
        const ruta = await this.rutaRepo.findOne({ where: { id: rutaId } });
        if (!ruta) {
            throw new NotFoundException(`Ruta ${rutaId} no encontrada`);
        }
        return ruta;
    }

    /**
     * Actualizar distancia recorrida de la ruta
     */
    private async actualizarDistanciaRuta(rutaId: string): Promise<void> {
        const ubicaciones = await this.ubicacionRepo.find({
            where: { rutaId },
            order: { timestamp: 'ASC' },
        });

        if (ubicaciones.length < 2) return;

        let distanciaTotal = 0;
        for (let i = 1; i < ubicaciones.length; i++) {
            const prev = ubicaciones[i - 1];
            const curr = ubicaciones[i];

            distanciaTotal += this.calcularDistanciaHaversine(
                Number(prev.latitud),
                Number(prev.longitud),
                Number(curr.latitud),
                Number(curr.longitud),
            );
        }

        await this.rutaRepo.update(rutaId, {
            distanciaRecorridaKm: distanciaTotal,
        });
    }

    /**
     * Calcular distancia entre dos puntos usando fórmula de Haversine
     * @returns Distancia en kilómetros
     */
    calcularDistanciaHaversine(
        lat1: number,
        lng1: number,
        lat2: number,
        lng2: number,
    ): number {
        const R = 6371; // Radio de la Tierra en km
        const dLat = this.toRad(lat2 - lat1);
        const dLng = this.toRad(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRad(degrees: number): number {
        return (degrees * Math.PI) / 180;
    }
}
