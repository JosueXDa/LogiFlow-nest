import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { VehiculoEntrega } from '../entities/vehiculo-entrega.entity';
import { TipoVehiculo, EstadoVehiculo } from '../../common/enums';

@Injectable()
export class VehiculoRepository extends Repository<VehiculoEntrega> {
    constructor(private dataSource: DataSource) {
        super(VehiculoEntrega, dataSource.createEntityManager());
    }

    async findDisponiblesPorTipo(tipo: TipoVehiculo): Promise<VehiculoEntrega[]> {
        return this.find({
            where: {
                tipo,
                estado: EstadoVehiculo.OPERATIVO,
            },
        });
    }
}
