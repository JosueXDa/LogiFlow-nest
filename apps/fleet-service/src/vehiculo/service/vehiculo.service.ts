import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { VehiculoRepository } from '../repository/vehiculo.repository';
import { VehiculoFactory } from './vehiculo.factory';
import { CreateVehiculoDto, UpdateVehiculoDto, FindVehiculosDto } from '../dto/vehiculo.dto';
import { VehiculoEntrega } from '../entities/vehiculo-entrega.entity';
import { TipoVehiculo } from '../../common/enums';
import { FleetEventPublisher } from '../../events/publishers/fleet-event.publisher';

@Injectable()
export class VehiculoService {
    constructor(
        private readonly vehiculoRepository: VehiculoRepository,
        private readonly vehiculoFactory: VehiculoFactory,
        // private readonly eventPublisher: FleetEventPublisher, // If we have events for vehicles
    ) { }

    async create(dto: CreateVehiculoDto): Promise<VehiculoEntrega> {
        const existePlaca = await this.vehiculoRepository.findOne({
            where: { placa: dto.placa },
        });

        if (existePlaca) {
            throw new ConflictException('Ya existe un vehículo con esta placa');
        }

        const vehiculo = this.vehiculoFactory.create(dto.tipo, dto);
        return this.vehiculoRepository.save(vehiculo);
    }

    async findAll(filters: FindVehiculosDto, page: number = 1, limit: number = 10) {
        const queryBuilder = this.vehiculoRepository.createQueryBuilder('vehiculo')
            .where('vehiculo.deletedAt IS NULL');

        if (filters.tipo) {
            queryBuilder.andWhere('vehiculo.tipo = :tipo', { tipo: filters.tipo });
        }

        if (filters.estado) {
            queryBuilder.andWhere('vehiculo.estado = :estado', { estado: filters.estado });
        }

        const [data, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    async findOne(id: string): Promise<VehiculoEntrega> {
        const vehiculo = await this.vehiculoRepository.findOne({ where: { id } });
        if (!vehiculo) {
            throw new NotFoundException('Vehículo no encontrado');
        }
        return vehiculo;
    }

    async update(id: string, dto: UpdateVehiculoDto): Promise<VehiculoEntrega> {
        const vehiculo = await this.findOne(id);
        Object.assign(vehiculo, dto);
        return this.vehiculoRepository.save(vehiculo);
    }

    async findDisponiblesPorTipo(tipo: TipoVehiculo): Promise<VehiculoEntrega[]> {
        return this.vehiculoRepository.findDisponiblesPorTipo(tipo);
    }
}
