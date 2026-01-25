import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InventoryController } from './inventory.controller';
import { InventoryEventsController } from './inventory-events.controller';
import { InventoryService } from './inventory.service';
import { Producto, ReservaStock } from './entities';
import { INVENTORY_EVENT_CLIENT } from './inventory.constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, ReservaStock]),
    ClientsModule.register([
      {
        name: INVENTORY_EVENT_CLIENT,
        transport: Transport.RMQ,
        options: {
          urls: [
            process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
          ],
          queue: 'inventory_events',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [InventoryController, InventoryEventsController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
