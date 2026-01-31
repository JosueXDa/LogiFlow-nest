import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonaController } from './controllers/zona.controller';
import { Zona } from './entities/zona.entity';
import { ZonaService } from './services/zona.service';

@Module({
    imports: [TypeOrmModule.forFeature([Zona])],
    controllers: [ZonaController],
    providers: [ZonaService],
    exports: [ZonaService],
})
export class ZonaModule { }
