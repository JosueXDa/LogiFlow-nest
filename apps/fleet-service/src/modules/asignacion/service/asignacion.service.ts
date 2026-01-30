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

        if (repartidores.length === 0) {
            throw new RpcException('No hay repartidores disponibles en la zona');
        }

        // 2. Seleccionar estrategia
        const strategy = this.getStrategy(dto.tipoEntrega);

        // 3. Ejecutar algoritmo de asignación
        const repartidorSeleccionado = strategy.asignarRepartidor(dto, repartidores);

        if (!repartidorSeleccionado) {
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
            vehiculoId: repartidorSeleccionado.vehiculoId,
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
}
