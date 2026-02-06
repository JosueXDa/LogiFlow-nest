import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from './constans';
import { AuthController } from './auth/auth.controller';
import { PedidosController } from './pedidos/pedidos.controller';
import { InventoryController } from './inventory/inventory.controller';
import { RepartidorController } from './flota/repartidor.controller';
import { VehiculoController } from './flota/vehiculo.controller';
import { AsignacionController } from './flota/asignacion.controller';
import { DisponibilidadController } from './flota/disponibilidad.controller';
import { BillingController } from './billing/billing.controller';
import { ZonaController } from './flota/zona.controller';
import { TrackingController } from './tracking/tracking.controller';
import { GraphqlModule } from './graphql/graphql.module';
import { EventsGateway } from './websocket/events.gateway';
import { WebSocketRelayConsumer } from './websocket/websocket-relay.consumer';
import { SessionValidatorModule } from './guards/session-validator.module';

@Module({
  imports: [
    SessionValidatorModule,
    GraphqlModule,
    ClientsModule.register([
      {
        name: MICROSERVICES_CLIENTS.PEDIDOS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 4004,
          retryAttempts: 5,
          retryDelay: 3000,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.FLEET_SERVICE,
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 4005,
          retryAttempts: 5,
          retryDelay: 3000,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.INVENTORY_SERVICE,
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 3004,
          retryAttempts: 5,
          retryDelay: 3000,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.BILLING_SERVICE,
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 4007,
          retryAttempts: 5,
          retryDelay: 3000,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.TRACKING_SERVICE,
        transport: Transport.TCP,
        options: {
          host: '127.0.0.1',
          port: 4008,
          retryAttempts: 5,
          retryDelay: 3000,
        },
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    PedidosController,
    InventoryController,
    RepartidorController,
    VehiculoController,
    AsignacionController,
    DisponibilidadController,
    BillingController,
    ZonaController,
    TrackingController,
    WebSocketRelayConsumer,
  ],
  providers: [AppService, EventsGateway],
})
export class AppModule { }
