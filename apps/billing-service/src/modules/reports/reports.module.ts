import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './services/reports.service';
import { Factura } from '../billing/entities/factura.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Factura]),
    ],
    providers: [ReportsService],
    exports: [ReportsService],
})
export class ReportsModule { }
