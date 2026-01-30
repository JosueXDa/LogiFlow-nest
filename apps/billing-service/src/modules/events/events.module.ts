import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PedidoEventsConsumer } from './consumers/pedido-events.consumer';
import { EntregaEventsConsumer } from './consumers/entrega-events.consumer';
import { BillingEventsProducer } from './producers/billing-events.producer';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: 'EVENTS_SERVICE',
                imports: [ConfigModule],
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => ({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get('rabbitmq.url') || process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
                        queue: 'events_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                }),
            },
        ]),
        BillingModule,
    ],
    providers: [
        PedidoEventsConsumer,
        EntregaEventsConsumer,
        BillingEventsProducer,
    ],
    exports: [BillingEventsProducer],
})
export class EventsModule { }
