import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('NotificationService');
  const rmqUrl = process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

  logger.log(`🔧 Connecting to RabbitMQ at: ${rmqUrl}`);

  const app = await NestFactory.create(AppModule);

  // Listen to pedidos_events_queue - same queue that pedidos-service emits to
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: 'pedidos_events_queue',
      noAck: false,
      prefetchCount: 1,
      queueOptions: { durable: true },
      wildcards: true,
    },
  });
  logger.log(`📡 Listening on 'pedidos_events_queue'`);

  // Listen to inventory_events_queue
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rmqUrl],
      queue: 'inventory_events_queue',
      noAck: false,
      prefetchCount: 1,
      queueOptions: { durable: true },
      wildcards: true,
    },
  });
  logger.log(`📡 Listening on 'inventory_events_queue'`);

  await app.startAllMicroservices();
  logger.log(`✅ Microservice transport started successfully`);

  await app.listen(3005);
  logger.log(`🚀 Notification Service HTTP running on: ${await app.getUrl()}`);
  logger.log(`🐰 Waiting for events...`);
}

bootstrap().catch((err) => {
  const logger = new Logger('NotificationService');
  logger.error(`❌ Failed to start Notification Service:`, err);
  process.exit(1);
});
