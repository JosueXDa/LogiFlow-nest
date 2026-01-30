import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crear la aplicación HTTP con rawBody habilitado para Better Auth
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Requerido para Better Auth
  });

  // Habilitar CORS
  app.enableCors({
    origin: [
      'http://localhost:3009',
      'http://localhost:4000',
      'http://localhost:5173',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    credentials: true,
  });

  // Configurar el microservicio TCP
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 4003,
    },
  });

  // Iniciar todos los microservicios
  await app.startAllMicroservices();

  // Iniciar el servidor HTTP
  await app.listen(process.env.PORT ?? 3001);

  console.log(`Auth Service is running on: ${await app.getUrl()}`);
}
void bootstrap();
