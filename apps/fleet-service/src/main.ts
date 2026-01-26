import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AllExceptionsFilter } from './common/filters/rpc-exception.filter';

async function bootstrap() {
  // Crear aplicación principal
  const app = await NestFactory.create(AppModule);

  // TCP para request-response (API Gateway)
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 4005,
    },
  });
  console.log('🔌 TCP Microservice listening on port 4005');

  // RabbitMQ para eventos
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
  console.log('🐰 RabbitMQ connected - Queue: fleet_queue');

  // Habilitar validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Filtro global de excepciones
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.startAllMicroservices();
  console.log('✅ Fleet Service started successfully');
}

void bootstrap();
