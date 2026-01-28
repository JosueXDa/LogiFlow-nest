import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Asignacion } from '../entities/asignacion.entity';
import { EstadoAsignacion } from '../../common/enums';

@Injectable()
export class AsignacionRepository extends Repository<Asignacion> {
    constructor(private dataSource: DataSource) {
        super(Asignacion, dataSource.createEntityManager());
    }

    async findActivasPorRepartidor(repartidorId: string): Promise<Asignacion[]> {
        return this.find({
            where: {
                repartidorId,
                estado: EstadoAsignacion.ASIGNADA || EstadoAsignacion.EN_CURSO,
            },
        });
    }
}
