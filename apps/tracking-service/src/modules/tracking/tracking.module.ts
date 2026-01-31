import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrackingController } from './controllers/tracking.controller';
import { TrackingService } from './services/tracking.service';
import { TrackingEventsProducer } from './producers/tracking-events.producer';
import { FleetEventsConsumer } from './consumers/fleet-events.consumer';
import { Ubicacion } from './entities/ubicacion.entity';
import { Ruta } from './entities/ruta.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Ubicacion, Ruta]),
        ClientsModule.registerAsync([
            {
                name: 'EVENTS_SERVICE',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [
                            configService.get('RABBITMQ_URL') ||
                            'amqp://admin:admin@localhost:5672',
                        ],
                        queue: 'events_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
            },
        ]),
    ],
    controllers: [TrackingController, FleetEventsConsumer],
    providers: [TrackingService, TrackingEventsProducer],
    exports: [TrackingService],
})
export class TrackingModule { }
