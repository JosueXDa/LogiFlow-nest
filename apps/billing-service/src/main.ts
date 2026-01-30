import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('BillingService');
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: process.env.TCP_HOST || '0.0.0.0',
      port: 3010,
      retryAttempts: 5,
      retryDelay: 3000,
    },
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'billing_queue',
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
        arguments: {
          'x-message-ttl': 86400000,
          'x-dead-letter-exchange': 'dlx.billing',
          'x-dead-letter-routing-key': 'billing.failed',
        },
      },
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  await app.startAllMicroservices();
  logger.log(`🚀 TCP Microservice listening on port ${process.env.TCP_PORT || 3004}`);
  logger.log(`🐰 RabbitMQ connected to billing_queue`);
}

bootstrap();
