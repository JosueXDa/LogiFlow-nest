import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Repartidor } from '../entities/repartidor.entity';
import { EstadoRepartidor } from '../../../common/enums';

@Injectable()
export class RepartidorRepository extends Repository<Repartidor> {
    constructor(private dataSource: DataSource) {
        super(Repartidor, dataSource.createEntityManager());
    }

    async findDisponiblesPorZona(zonaId?: string): Promise<Repartidor[]> {
        const query = this.createQueryBuilder('repartidor')
            .leftJoinAndSelect('repartidor.vehiculo', 'vehiculo')
            .where('repartidor.estado = :estado', { estado: EstadoRepartidor.DISPONIBLE });

        // Solo filtrar por zona si se proporciona
        if (zonaId) {
            query.andWhere('repartidor.zonaId = :zonaId', { zonaId });
        }

        return query.getMany();
    }
}
