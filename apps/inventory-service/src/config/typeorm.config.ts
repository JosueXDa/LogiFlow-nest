import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Producto, ReservaStock } from '../inventory/entities';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    // Usar DATABASE_URL si está disponible (Kubernetes), sino variables individuales (desarrollo)
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    
    if (databaseUrl) {
      return {
        type: 'postgres',
        url: databaseUrl,
        entities: [Producto, ReservaStock],
        synchronize: this.configService.get<boolean>('DB_SYNC', true),
        logging: this.configService.get<boolean>('DB_LOGGING', false),
      };
    }
    
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5435),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_DATABASE', 'inventory_db'),
      entities: [Producto, ReservaStock],
      synchronize: this.configService.get<boolean>('DB_SYNC', true),
      logging: this.configService.get<boolean>('DB_LOGGING', false),
    };
  }
}
