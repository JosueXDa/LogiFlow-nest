import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tarifa, TipoEntrega, TipoVehiculo } from '../entities/tarifa.entity';
import { CalcularTarifaDto } from '../dto/calcular-tarifa.dto';
import { TariffStrategy } from '../strategies/tariff-strategy.interface';
import { UrbanTariffStrategy } from '../strategies/urban-tariff.strategy';
import { IntermunicipalTariffStrategy } from '../strategies/intermunicipal-tariff.strategy';
import { NationalTariffStrategy } from '../strategies/national-tariff.strategy';

@Injectable()
export class TariffCalculatorService {
    private strategies: Map<TipoEntrega, TariffStrategy>;

    constructor(
        @InjectRepository(Tarifa)
        private readonly tarifaRepository: Repository<Tarifa>,
        private readonly urbanStrategy: UrbanTariffStrategy,
        private readonly intermunicipalStrategy: IntermunicipalTariffStrategy,
        private readonly nationalStrategy: NationalTariffStrategy,
    ) {
        // Patrón Strategy: Registro de estrategias de cálculo
        this.strategies = new Map([
            [TipoEntrega.URBANA, this.urbanStrategy],
            [TipoEntrega.INTERMUNICIPAL, this.intermunicipalStrategy],
            [TipoEntrega.NACIONAL, this.nationalStrategy],
        ]);
    }

    /**
     * Calcular tarifa según tipo de entrega
     * Utiliza patrón Strategy
     */
    async calcularTarifa(dto: CalcularTarifaDto) {
        // Obtener tarifa base del catálogo
        const tarifa = await this.obtenerTarifa(dto.tipoEntrega, dto.tipoVehiculo);

        // Seleccionar estrategia según tipo de entrega
        const strategy = this.strategies.get(dto.tipoEntrega);
        if (!strategy) {
            throw new NotFoundException(
                `Estrategia no encontrada para ${dto.tipoEntrega}`,
            );
        }

        // Calcular usando la estrategia correspondiente
        const calculo = strategy.calcular(tarifa, dto);

        // Calcular IVA (12% en Ecuador)
        const iva = calculo.subtotal * 0.12;
        const total = calculo.subtotal + iva - calculo.descuento;

        return {
            subtotal: Number(calculo.subtotal.toFixed(2)),
            descuento: Number(calculo.descuento.toFixed(2)),
            iva: Number(iva.toFixed(2)),
            total: Number(total.toFixed(2)),
            detalles: calculo.detalles,
            breakdown: calculo.breakdown,
        };
    }

    /**
     * Obtener tarifa activa del catálogo
     */
    private async obtenerTarifa(
        tipoEntrega: TipoEntrega,
        tipoVehiculo: TipoVehiculo,
    ): Promise<Tarifa> {
        const tarifa = await this.tarifaRepository.findOne({
            where: {
                tipoEntrega,
                tipoVehiculo,
                activa: true,
            },
        });

        if (!tarifa) {
            throw new NotFoundException(
                `Tarifa no encontrada para ${tipoEntrega} - ${tipoVehiculo}`,
            );
        }

        // Validar vigencia
        const ahora = new Date();
        if (tarifa.validaDesde && tarifa.validaDesde > ahora) {
            throw new NotFoundException('Tarifa aún no vigente');
        }
        if (tarifa.validaHasta && tarifa.validaHasta < ahora) {
            throw new NotFoundException('Tarifa ya no vigente');
        }

        return tarifa;
    }
}
