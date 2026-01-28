import { Module } from '@nestjs/common';
import { DisponibilidadController } from './disponibilidad.controller';
import { DisponibilidadService } from './disponibilidad.service';
import { RepartidorModule } from '../repartidor/repartidor.module';

@Module({
    imports: [RepartidorModule],
    controllers: [DisponibilidadController],
    providers: [DisponibilidadService],
})
export class DisponibilidadModule { }
