import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // TCP para request-response (API Gateway)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 4004,
      retryAttempts: 5,
      retryDelay: 3000,
    },
  });
  logger.log('🔌 TCP Microservice listening on 127.0.0.1:4004');

  // RabbitMQ para eventos
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'pedidos_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  logger.log('🐰 RabbitMQ connected - Queue: pedidos_queue');

  // RabbitMQ para escuchar eventos de Fleet
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'fleet_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  logger.log('🐰 RabbitMQ connected - Queue: fleet_events_queue');

  // RabbitMQ para escuchar eventos de Billing
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'billing_events_queue',
      queueOptions: {
        durable: true,
      },
    },
  });
  logger.log('🐰 RabbitMQ connected - Queue: billing_events_queue');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.startAllMicroservices();
  logger.log('✅ Pedidos Service started successfully');
}
void bootstrap();
