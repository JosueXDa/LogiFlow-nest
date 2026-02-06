import { Module, Global, forwardRef } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetEventPublisher } from './publishers/fleet-event.publisher';
import { TrackingEventsConsumer } from './consumers/tracking-events.consumer';
import { PedidoEventsConsumer } from './consumers/pedido-events.consumer';
import { Repartidor } from '../repartidor/entities/repartidor.entity';
import { AsignacionModule } from '../asignacion/asignacion.module';
import { FLEET_EVENT_CLIENT } from './constants';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Repartidor]),
        forwardRef(() => AsignacionModule),
        ClientsModule.registerAsync([
            {
                name: FLEET_EVENT_CLIENT,
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@localhost:5672'],
                        queue: 'fleet_events_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [TrackingEventsConsumer, PedidoEventsConsumer],
    providers: [FleetEventPublisher],
    exports: [FleetEventPublisher, ClientsModule],
})
export class EventsModule { }
