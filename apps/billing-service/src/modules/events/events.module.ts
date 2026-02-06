import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PedidoEventsConsumer } from './consumers/pedido-events.consumer';
import { EntregaEventsConsumer } from './consumers/entrega-events.consumer';
import { TrackingEventsConsumer } from './consumers/tracking-events.consumer';
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
                        queue: 'billing_events_queue',
                        queueOptions: {
                            durable: true,
                        },
                        // Emit to Topic Exchange for audit interception
                        exchange: 'logiflow_events',
                        exchangeType: 'topic',
                    },
                }),
            },
        ]),
        BillingModule,
    ],
    providers: [
        PedidoEventsConsumer,
        EntregaEventsConsumer,
        TrackingEventsConsumer,
        BillingEventsProducer,
    ],
    exports: [BillingEventsProducer],
})
export class EventsModule { }
