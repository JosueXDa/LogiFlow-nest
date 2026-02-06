import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repartidor } from './entities/repartidor.entity';
import { RepartidorService } from './service/repartidor.service';
import { RepartidorRepository } from './repository/repartidor.repository';
import { RepartidorController } from './repartidor.controller';
import { EventsModule } from '../events/events.module';
import { VehiculoModule } from '../vehiculo/vehiculo.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Repartidor]),
        forwardRef(() => EventsModule),
        VehiculoModule,
    ],
    controllers: [RepartidorController],
    providers: [RepartidorService, RepartidorRepository],
    exports: [RepartidorService],
})
export class RepartidorModule { }
