import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) { }

    createTypeOrmOptions(): TypeOrmModuleOptions {
        // Usar DATABASE_URL si está disponible (Kubernetes), sino variables individuales (desarrollo)
        const databaseUrl = this.configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
            return {
                type: 'postgres',
                url: databaseUrl,
                migrations: [__dirname + '/migrations/**/{.js,.ts}'],
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
                logging: this.configService.get<string>('NODE_ENV') === 'development',
                autoLoadEntities: true,
            };
        }
        
        return {
            type: 'postgres',
            host: this.configService.get<string>('DB_HOST', 'localhost'),
            port: this.configService.get<number>('DB_PORT', 5432),
            username: this.configService.get<string>('DB_USERNAME', 'postgres'),
            password: this.configService.get<string>('DB_PASSWORD', 'postgres'),
            database: this.configService.get<string>('DB_NAME', 'fleet_db'),
            migrations: [__dirname + '/migrations/**/{.js,.ts}'],
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: this.configService.get<string>('NODE_ENV') !== 'production',
            logging: this.configService.get<string>('NODE_ENV') === 'development',
            autoLoadEntities: true,
        };
    }
}