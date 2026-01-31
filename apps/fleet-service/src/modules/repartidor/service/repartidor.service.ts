import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Repartidor } from '../entities/repartidor.entity';
import { CreateRepartidorDto, UpdateRepartidorDto, FindRepartidoresDto } from '../dto/repartidor.dto';
import { EstadoRepartidor } from '../../../common/enums';
import { FleetEventPublisher } from '../../events/publishers/fleet-event.publisher';
import { RepartidorRepository } from '../repository/repartidor.repository';

@Injectable()
export class RepartidorService {
    constructor(
        private readonly repartidorRepository: RepartidorRepository,
        private readonly eventPublisher: FleetEventPublisher,
    ) { }

    async create(dto: CreateRepartidorDto): Promise<Repartidor> {
        // Verificar si la cédula ya existe
        const existeCedula = await this.repartidorRepository.findOne({
            where: { cedula: dto.cedula },
        });

        if (existeCedula) {
            throw new ConflictException('Ya existe un repartidor con esta cédula');
        }

        // Verificar si el email ya existe
        const existeEmail = await this.repartidorRepository.findOne({
            where: { email: dto.email },
        });

        if (existeEmail) {
            throw new ConflictException('Ya existe un repartidor con este email');
        }

        const repartidor = this.repartidorRepository.create(dto);
        const saved = await this.repartidorRepository.save(repartidor);

        // Publicar evento
        await this.eventPublisher.publishRepartidorCreated({
            repartidorId: saved.id,
            nombre: saved.nombre,
            apellido: saved.apellido,
            email: saved.email,
            telefono: saved.telefono,
            zonaId: saved.zonaId,
            vehiculoId: saved.vehiculoId,
        });

        return saved;
    }

    async findAll(filters: FindRepartidoresDto, page: number = 1, limit: number = 10) {
        const queryBuilder = this.repartidorRepository
            .createQueryBuilder('repartidor')
            .leftJoinAndSelect('repartidor.vehiculo', 'vehiculo')
            .where('repartidor.deletedAt IS NULL');

        if (filters.estado) {
            queryBuilder.andWhere('repartidor.estado = :estado', {
                estado: filters.estado,
            });
        }

        if (filters.zonaId) {
            queryBuilder.andWhere('repartidor.zonaId = :zonaId', {
                zonaId: filters.zonaId,
            });
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async findOne(id: string): Promise<Repartidor> {
        const repartidor = await this.repartidorRepository.findOne({
            where: { id },
            relations: ['vehiculo'],
        });

        if (!repartidor) {
            throw new NotFoundException('Repartidor no encontrado');
        }

        return repartidor;
    }

    async update(id: string, dto: UpdateRepartidorDto): Promise<Repartidor> {
        const repartidor = await this.findOne(id);

        Object.assign(repartidor, dto);

        return this.repartidorRepository.save(repartidor);
    }

    async cambiarEstado(
        id: string,
        estado: EstadoRepartidor,
        motivo?: string,
    ): Promise<Repartidor> {
        const repartidor = await this.findOne(id);
        const estadoAnterior = repartidor.estado;

        repartidor.cambiarEstado(estado);
        const updated = await this.repartidorRepository.save(repartidor);

        // Publicar evento
        await this.eventPublisher.publishEstadoChanged({
            repartidorId: id,
            estadoAnterior,
            estadoNuevo: estado,
            motivo,
        });

        return updated;
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id); // Ensure exists
        await this.repartidorRepository.softDelete(id);
    }

    async findDisponiblesPorZona(zonaId: string): Promise<Repartidor[]> {
        return this.repartidorRepository.findDisponiblesPorZona(zonaId);
    }
}
