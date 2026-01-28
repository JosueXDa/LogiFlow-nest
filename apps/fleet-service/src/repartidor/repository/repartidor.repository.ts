import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Repartidor } from '../entities/repartidor.entity';
import { EstadoRepartidor } from '../../common/enums';

@Injectable()
export class RepartidorRepository extends Repository<Repartidor> {
    constructor(private dataSource: DataSource) {
        super(Repartidor, dataSource.createEntityManager());
    }

    async findDisponiblesPorZona(zonaId: string): Promise<Repartidor[]> {
        return this.find({
            where: {
                zonaId,
                estado: EstadoRepartidor.DISPONIBLE,
            },
            relations: ['vehiculo'],
        });
    }
}
