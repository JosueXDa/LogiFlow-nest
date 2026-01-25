import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import {
  Vehiculo,
  Conductor,
  Motorizado,
  VehiculoLiviano,
  Camion,
} from '../flota/entities';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5434),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_DATABASE', 'fleet_db'),
      entities: [Vehiculo, Conductor, Motorizado, VehiculoLiviano, Camion],
      synchronize: this.configService.get<boolean>('DB_SYNC', true),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
    };
  }
}
