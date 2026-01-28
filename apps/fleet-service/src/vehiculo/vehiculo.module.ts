import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculoEntrega } from './entities/vehiculo-entrega.entity';
import { Motorizado } from './entities/motorizado.entity';
import { VehiculoLiviano } from './entities/vehiculo-liviano.entity';
import { Camion } from './entities/camion.entity';
import { VehiculoService } from './service/vehiculo.service';
import { VehiculoFactory } from './service/vehiculo.factory';
import { VehiculoRepository } from './repository/vehiculo.repository';
import { VehiculoController } from './vehiculo.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            VehiculoEntrega,
            Motorizado,
            VehiculoLiviano,
            Camion,
        ]),
    ],
    controllers: [VehiculoController],
    providers: [VehiculoService, VehiculoFactory, VehiculoRepository],
    exports: [VehiculoService],
})
export class VehiculoModule { }
