import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FleetEventPublisher } from './publishers/fleet-event.publisher';
import { TrackingEventsConsumer } from './consumers/tracking-events.consumer';
import { Repartidor } from '../repartidor/entities/repartidor.entity';
import { FLEET_EVENT_CLIENT } from './constants';

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([Repartidor]),
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
                            arguments: {
                                'x-message-ttl': 86400000,
                                'x-dead-letter-exchange': 'dlx.fleet',
                                'x-dead-letter-routing-key': 'fleet.failed',
                            },
                        },
                        // Emit to Topic Exchange for audit interception
                        exchange: 'logiflow_events',
                        exchangeType: 'topic',
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    controllers: [TrackingEventsConsumer],
    providers: [FleetEventPublisher],
    exports: [FleetEventPublisher, ClientsModule],
})
export class EventsModule { }
