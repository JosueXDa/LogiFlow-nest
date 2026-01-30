import { Tarifa } from '../entities/tarifa.entity';
import { CalcularTarifaDto } from '../dto/calcular-tarifa.dto';

export interface CalculoResult {
    subtotal: number;
    descuento: number;
    detalles: Array<{
        concepto: string;
        descripcion: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
        descuento: number;
        total: number;
    }>;
    breakdown: {
        tarifaBase: number;
        costoPorKm?: number;
        costoPorKg?: number;
        recargoUrgencia?: number;
        factorZona?: number;
        descuentoAplicado?: number;
    };
}

export interface TariffStrategy {
    calcular(tarifa: Tarifa, dto: CalcularTarifaDto): CalculoResult;
}
