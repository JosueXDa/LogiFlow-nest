import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Pedido, ItemPedido } from './entities';
import { PedidosController } from './pedidos.controller';
import { PedidosEventsController } from './pedidos-events.controller';
import { PEDIDOS_EVENT_CLIENT, INVENTORY_CLIENT } from './pedidos.constants';
import { PedidosService } from './service/impl/pedidos.service';
import { PEDIDOS_SERVICE } from './service/pedidos-service.interface';
import { PedidosRepository } from './repository/pedidos.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Pedido, ItemPedido]),
    ClientsModule.register([
      {
        name: PEDIDOS_EVENT_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL ?? 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'pedidos_events',
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
  controllers: [PedidosController, PedidosEventsController],
  providers: [
    PedidosRepository,
    {
      provide: PEDIDOS_SERVICE,
      useClass: PedidosService,
    },
  ],
  exports: [PEDIDOS_SERVICE],
})
export class PedidosModule {}
