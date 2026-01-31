import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) { }

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST') || 'localhost',
      port: parseInt(this.configService.get('DB_PORT') || '5437', 10),
      username: this.configService.get('DB_USER') || 'postgres',
      password: this.configService.get('DB_PASSWORD') || 'postgres',
      database: this.configService.get('DB_NAME') || 'tracking_db',
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: this.configService.get('NODE_ENV') !== 'production',
      logging: this.configService.get('NODE_ENV') === 'development',
    };
  }
}