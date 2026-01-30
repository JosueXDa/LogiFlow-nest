import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './config/typeorm.config';
import { RepartidorModule } from './modules/repartidor/repartidor.module';
import { VehiculoModule } from './modules/vehiculo/vehiculo.module';
import { AsignacionModule } from './modules/asignacion/asignacion.module';
import { DisponibilidadModule } from './modules/disponibilidad/disponibilidad.module';
import { EventsModule } from './modules/events/events.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: TypeOrmConfigService,
    }),
    RepartidorModule,
    VehiculoModule,
    AsignacionModule,
    DisponibilidadModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
