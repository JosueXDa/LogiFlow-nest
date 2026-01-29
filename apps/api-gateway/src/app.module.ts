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

@Module({
  imports: [
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
  ],
  providers: [AppService],
})
export class AppModule {}
