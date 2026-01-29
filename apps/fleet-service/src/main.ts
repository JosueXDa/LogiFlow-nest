import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { RpcExceptionFilterImplementation } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  const logger = new Logger('FleetService');
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.FLEET_HOST || '0.0.0.0',
      port: parseInt(process.env.FLEET_PORT ?? '4005'),
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'fleet_queue',
      queueOptions: {
        durable: true,
      },
    },
  });

  app.useGlobalFilters(new RpcExceptionFilterImplementation());

  await app.startAllMicroservices();

  await app.init();

  logger.log('Fleet Service is running (TCP + RabbitMQ)');
}
bootstrap();
