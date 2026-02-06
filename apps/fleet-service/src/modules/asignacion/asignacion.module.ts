import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignacion } from './entities/asignacion.entity';
import { AsignacionService } from './service/asignacion.service';
import { AsignacionRepository } from './repository/asignacion.repository';
import { AsignacionController } from './asignacion.controller';
import { AsignacionEventsController } from './asignacion-events.controller';
import { UrbanaStrategy } from './service/strategies/urbana.strategy';
import { IntermunicipalStrategy } from './service/strategies/intermunicipal.strategy';
import { NacionalStrategy } from './service/strategies/nacional.strategy';
import { RepartidorModule } from '../repartidor/repartidor.module';
import { EventsModule } from '../events/events.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Asignacion]),
        forwardRef(() => RepartidorModule),
        forwardRef(() => EventsModule),
    ],
    controllers: [AsignacionController, AsignacionEventsController],
    providers: [
        AsignacionService,
        AsignacionRepository,
        UrbanaStrategy,
        IntermunicipalStrategy,
        NacionalStrategy,
    ],
    exports: [AsignacionService],
})
export class AsignacionModule { }
