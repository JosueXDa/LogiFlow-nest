import { Module, Global } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FleetEventPublisher } from './publishers/fleet-event.publisher';
import { FLEET_EVENT_CLIENT } from './constants';

@Global()
@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: FLEET_EVENT_CLIENT,
                imports: [ConfigModule],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get<string>('RABBITMQ_URL') || 'amqp://admin:admin@localhost:5672'],
                        queue: 'fleet_events',
                        queueOptions: {
                            durable: true,
                            arguments: {
                                'x-message-ttl': 86400000,
                                'x-dead-letter-exchange': 'dlx.fleet',
                                'x-dead-letter-routing-key': 'fleet.failed',
                            },
                        },
                    },
                }),
                inject: [ConfigService],
            },
        ]),
    ],
    providers: [FleetEventPublisher],
    exports: [FleetEventPublisher, ClientsModule],
})
export class EventsModule { }
