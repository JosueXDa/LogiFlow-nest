import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  const app = await NestFactory.create(AppModule);

  // Conectar RabbitMQ para consumir eventos
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672'],
      queue: 'gateway_queue',
      noAck: false,
      prefetchCount: 1,
      queueOptions: {
        durable: true,
      },
    },
  });

  // Global Validation Pipe
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

  // Habilitar CORS para permitir peticiones desde el frontend
  app.enableCors({
    origin: [
      'http://localhost:3009',
      'http://localhost:4000',
      'http://localhost:5173', // Vite default port
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  // Iniciar todos los microservicios
  await app.startAllMicroservices();
  logger.log('🐰 RabbitMQ consumer connected to gateway_queue');

  await app.listen(process.env.PORT ?? 3009);
  logger.log(`🚀 API Gateway is running on: ${await app.getUrl()}`);
  logger.log(`🔌 WebSocket server available at: ws://localhost:${process.env.PORT ?? 3009}/ws`);
}
void bootstrap();
