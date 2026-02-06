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

@Module({
  imports: [
    GraphqlModule,
    ClientsModule.register([
      {
        name: MICROSERVICES_CLIENTS.PEDIDOS_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 4004,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.FLEET_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 4005,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.INVENTORY_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 4006,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.BILLING_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 4007,
        },
      },
      {
        name: MICROSERVICES_CLIENTS.TRACKING_SERVICE,
        transport: Transport.TCP,
        options: {
          port: 4008,
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
