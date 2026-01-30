import { Test, TestingModule } from '@nestjs/testing';
import { TariffCalculatorService } from '../../src/modules/billing/services/tariff-calculator.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tarifa } from '../../src/modules/billing/entities/tarifa.entity';
import { UrbanTariffStrategy } from '../../src/modules/billing/services/strategies/urban-tariff.strategy';
import { IntermunicipalTariffStrategy } from '../../src/modules/billing/services/strategies/intermunicipal-tariff.strategy';
import { NationalTariffStrategy } from '../../src/modules/billing/services/strategies/national-tariff.strategy';

describe('TariffCalculatorService', () => {
    let service: TariffCalculatorService;

    const mockTarifaRepository = {
        findOne: jest.fn(),
    };

    const mockUrbanStrategy = {
        calcular: jest.fn(),
    };
    const mockIntermunicipalStrategy = {
        calcular: jest.fn(),
    };
    const mockNationalStrategy = {
        calcular: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TariffCalculatorService,
                {
                    provide: getRepositoryToken(Tarifa),
                    useValue: mockTarifaRepository,
                },
                {
                    provide: UrbanTariffStrategy,
                    useValue: mockUrbanStrategy,
                },
                {
                    provide: IntermunicipalTariffStrategy,
                    useValue: mockIntermunicipalStrategy,
                },
                {
                    provide: NationalTariffStrategy,
                    useValue: mockNationalStrategy,
                },
            ],
        }).compile();

        service = module.get<TariffCalculatorService>(TariffCalculatorService);
    });

    it('debe estar definido', () => {
        expect(service).toBeDefined();
    });
});
