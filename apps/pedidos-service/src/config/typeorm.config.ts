// No cargar dotenv - en desarrollo local usa .env, en Kubernetes usa ConfigMap
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ItemPedido, Pedido } from '../pedidos/entities';

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
        entities: [Pedido, ItemPedido],
        migrations: [__dirname + '/../db/migrations/**/*{.ts,.js}'],
        synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
        logging: this.configService.get<string>('NODE_ENV') === 'development',
        autoLoadEntities: true,
      };
    }
    
    return {
      type: 'postgres',
      host: this.configService.get<string>('DB_HOST', 'localhost'),
      port: this.configService.get<number>('DB_PORT', 5433),
      username: this.configService.get<string>('DB_USERNAME', 'postgres'),
      password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
      database: this.configService.get<string>('DB_NAME', 'pedidos_db'),
      entities: [Pedido, ItemPedido],
      migrations: [__dirname + '/../db/migrations/**/*{.ts,.js}'],
      synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
      logging: this.configService.get<string>('NODE_ENV') === 'development',
      autoLoadEntities: true,
    };
  }
}

export const AppDataSource = new DataSource(
  process.env.DATABASE_URL
    ? {
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [Pedido, ItemPedido],
        migrations: [__dirname + '/../db/migrations/**/*{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: Number(process.env.DB_PORT ?? 5432),
        username: process.env.DB_USERNAME ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'postgres',
        database: process.env.DB_NAME ?? 'pedidos_db',
        entities: [Pedido, ItemPedido],
        migrations: [__dirname + '/../db/migrations/**/*{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
      }
);
