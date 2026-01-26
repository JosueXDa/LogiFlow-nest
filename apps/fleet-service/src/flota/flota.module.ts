import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  Conductor,
  Vehiculo,
  Motorizado,
  VehiculoLiviano,
  Camion,
} from './entities';
import { FlotaService } from './flota.service';
import { FlotaController } from './flota.controller';
import { FlotaEventsController } from './flota-events.controller';
import { FLOTA_EVENT_CLIENT, INVENTORY_CLIENT } from './flota.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conductor,
      Vehiculo,
      Motorizado,
      VehiculoLiviano,
      Camion,
    ]),
    // Cliente RabbitMQ para EMITIR eventos
    ClientsModule.register([
      {
        name: FLOTA_EVENT_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'fleet_events',
          queueOptions: {
            durable: true,
          },
        },
      },
      {
        name: INVENTORY_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'inventory_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [
    FlotaController, // Escucha MessagePattern (TCP)
    FlotaEventsController, // Escucha EventPattern (RabbitMQ)
  ],
  providers: [FlotaService],
  exports: [FlotaService],
})
export class FlotaModule { }
