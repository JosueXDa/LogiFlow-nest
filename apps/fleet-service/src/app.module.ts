import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './config/typeorm.config';
import { RepartidorModule } from './repartidor/repartidor.module';
import { VehiculoModule } from './vehiculo/vehiculo.module';
import { AsignacionModule } from './asignacion/asignacion.module';
import { DisponibilidadModule } from './disponibilidad/disponibilidad.module';
import { EventsModule } from './events/events.module';
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
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
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
