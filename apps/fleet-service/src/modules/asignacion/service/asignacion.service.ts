import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { AsignacionRepository } from '../repository/asignacion.repository';
import { Asignacion } from '../entities/asignacion.entity';
import { AsignarRepartidorDto, FinalizarAsignacionDto } from '../dto/asignacion.dto';
import { FleetEventPublisher } from '../../events/publishers/fleet-event.publisher';
import { RepartidorService } from '../../repartidor/service/repartidor.service';
import { TipoEntrega, EstadoAsignacion, EstadoRepartidor } from '../../../common/enums';
import { IAsignacionStrategy } from './strategies/asignacion.strategy';
import { UrbanaStrategy } from './strategies/urbana.strategy';
import { IntermunicipalStrategy } from './strategies/intermunicipal.strategy';
import { NacionalStrategy } from './strategies/nacional.strategy';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AsignacionService {
    private readonly logger = new Logger(AsignacionService.name);

    constructor(
        private readonly asignacionRepository: AsignacionRepository,
        private readonly repartidorService: RepartidorService,
        private readonly eventPublisher: FleetEventPublisher,
        private readonly urbanaStrategy: UrbanaStrategy,
        private readonly intermunicipalStrategy: IntermunicipalStrategy,
        private readonly nacionalStrategy: NacionalStrategy,
    ) { }

    private getStrategy(tipo: TipoEntrega): IAsignacionStrategy {
        switch (tipo) {
            case TipoEntrega.URBANA:
                return this.urbanaStrategy;
            case TipoEntrega.INTERMUNICIPAL:
                return this.intermunicipalStrategy;
            case TipoEntrega.NACIONAL:
                return this.nacionalStrategy;
            default:
                return this.urbanaStrategy;
        }
    }

    async asignarPedido(dto: AsignarRepartidorDto): Promise<Asignacion> {
        this.logger.log(`Intentando asignar pedido ${dto.pedidoId}`);

        // 1. Obtener repartidores disponibles en la zona
        const repartidores = await this.repartidorService.findDisponiblesPorZona(dto.zonaId);

        this.logger.log(`📋 Encontrados ${repartidores.length} repartidores disponibles`);

        if (repartidores.length === 0) {
            throw new RpcException('No hay repartidores disponibles en la zona');
        }

        // Log detalles de cada repartidor
        repartidores.forEach(rep => {
            this.logger.debug(
                `   Repartidor: ${rep.nombre}, ` +
                `Vehículo: ${rep.vehiculo?.tipo || 'N/A'}, ` +
                `Capacidad: ${rep.vehiculo?.capacidadKg || 0}kg/${rep.vehiculo?.capacidadM3 || 0}m3`
            );
        });

        // 2. Seleccionar estrategia
        const strategy = this.getStrategy(dto.tipoEntrega);
        this.logger.log(`📐 Usando estrategia: ${dto.tipoEntrega}`);
        this.logger.log(`📦 Pedido requiere: ${dto.pesoKg}kg / ${dto.volumenM3}m3`);

        // 3. Ejecutar algoritmo de asignación
        const repartidorSeleccionado = strategy.asignarRepartidor(dto, repartidores);

        if (!repartidorSeleccionado) {
            this.logger.error('❌ Ningún repartidor pasó el filtro de compatibilidad');
            throw new RpcException('No se encontro un repartidor compatible para el pedido');
        }

        // 4. Crear asignación
        const asignacion = this.asignacionRepository.create({
            pedidoId: dto.pedidoId,
            repartidorId: repartidorSeleccionado.id,
            repartidor: repartidorSeleccionado,
            fechaAsignacion: new Date(),
            estado: EstadoAsignacion.ASIGNADA,
            distanciaKm: 10, // Mock calculation
            tiempoEstimadoMin: 30, // Mock calculation
        });

        const saved = await this.asignacionRepository.save(asignacion);

        // 5. Actualizar estado del repartidor (Opcional, depende de reglas de negocio)
        // await this.repartidorService.cambiarEstado(repartidorSeleccionado.id, EstadoRepartidor.OCUPADO); 

        // 6. Publicar evento
        await this.eventPublisher.publishAsignacionCreated({
            asignacionId: saved.id,
            pedidoId: saved.pedidoId,
            repartidorId: saved.repartidorId,
            vehiculoId: repartidorSeleccionado.vehiculo?.id,
            tipoVehiculo: repartidorSeleccionado.vehiculo?.tipo,
            zonaId: dto.zonaId,
            distanciaKm: saved.distanciaKm,
            tiempoEstimadoMin: saved.tiempoEstimadoMin,
        });

        return saved;
    }

    async iniciarAsignacion(id: string): Promise<Asignacion> {
        const asignacion = await this.asignacionRepository.findOne({ where: { id } });
        if (!asignacion) throw new NotFoundException('Asignacion no encontrada');

        asignacion.iniciar();
        return this.asignacionRepository.save(asignacion);
    }

    async finalizarAsignacion(dto: FinalizarAsignacionDto): Promise<Asignacion> {
        const asignacion = await this.asignacionRepository.findOne({ where: { id: dto.id } });
        if (!asignacion) throw new NotFoundException('Asignacion no encontrada');

        asignacion.completar(dto.observaciones);
        const saved = await this.asignacionRepository.save(asignacion);

        // Notify completion? Yes usually
        // this.eventPublisher.publishAsignacionCompleted(...) 

        return saved;
    }

    async findAll(filters: any, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const where: any = {};

        // Aplicar filtros
        if (filters.pedidoId) {
            where.pedidoId = filters.pedidoId;
        }
        if (filters.repartidorId) {
            where.repartidorId = filters.repartidorId;
        }
        if (filters.estado) {
            where.estado = filters.estado;
        }

        const [data, total] = await this.asignacionRepository.findAndCount({
            where,
            relations: ['repartidor', 'repartidor.vehiculo'],
            take: limit,
            skip,
            order: { fechaAsignacion: 'DESC' },
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
