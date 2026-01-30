import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './controllers/billing.controller';
import { BillingService } from './services/billing.service';
import { TariffCalculatorService } from './services/tariff-calculator.service';
import { InvoiceGeneratorService } from './services/invoice-generator.service';
import { Factura } from './entities/factura.entity';
import { DetalleFactura } from './entities/detalle-factura.entity';
import { Tarifa } from './entities/tarifa.entity';
import { UrbanTariffStrategy } from './strategies/urban-tariff.strategy';
import { IntermunicipalTariffStrategy } from './strategies/intermunicipal-tariff.strategy';
import { NationalTariffStrategy } from './strategies/national-tariff.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([Factura, DetalleFactura, Tarifa]),
    ],
    controllers: [BillingController],
    providers: [
        BillingService,
        TariffCalculatorService,
        InvoiceGeneratorService,
        UrbanTariffStrategy,
        IntermunicipalTariffStrategy,
        NationalTariffStrategy,
    ],
    exports: [BillingService],
})
export class BillingModule { }
