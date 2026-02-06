import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('APIGateway');
  const app = await NestFactory.create(AppModule);

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('LogiFlow API')
    .setDescription(
      'API Gateway para el sistema de logística LogiFlow. Incluye endpoints para gestión de pedidos, flota, inventario, facturación y tracking.'
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('better-auth.session_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'better-auth.session_token',
    })
    .addTag('Auth', 'Autenticación y autorización')
    .addTag('Billing', 'Facturación y tarifas')
    .addTag('Inventory', 'Gestión de productos y stock')
    .addTag('Pedidos', 'Gestión de pedidos')
    .addTag('Tracking', 'Seguimiento de ubicación y rutas')
    .addTag('Fleet-Repartidores', 'Gestión de repartidores')
    .addTag('Fleet-Vehiculos', 'Gestión de vehículos')
    .addTag('Fleet-Zonas', 'Gestión de zonas de cobertura')
    .addTag('Fleet-Asignaciones', 'Asignación de pedidos a repartidores')
    .addTag('Fleet-Disponibilidad', 'Consulta de disponibilidad')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'LogiFlow API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true, // Habilita el envío de cookies del navegador
      requestInterceptor: (req) => {
        // Asegura que las credenciales (cookies) se incluyan en todas las peticiones
        req.credentials = 'include';
        // Agrega el header Origin para que el servidor acepte la petición
        req.headers['Origin'] = 'http://localhost:3000';
        return req;
      },
    },
  });

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
  logger.log(`🔌 Swagger available at: http://localhost:${process.env.PORT ?? 3009}/api`);
}
void bootstrap();
