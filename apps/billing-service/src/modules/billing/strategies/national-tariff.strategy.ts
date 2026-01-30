import { Injectable } from '@nestjs/common';
import { TariffStrategy, CalculoResult } from './tariff-strategy.interface';
import { Tarifa } from '../entities/tarifa.entity';
import { CalcularTarifaDto } from '../dto/calcular-tarifa.dto';

/**
 * Estrategia de cálculo para entregas nacionales
 * - Tarifa base + costo por km + costo por kg
 * - Descuento por volumen
 */
@Injectable()
export class NationalTariffStrategy implements TariffStrategy {
    calcular(tarifa: Tarifa, dto: CalcularTarifaDto): CalculoResult {
        let subtotal = Number(tarifa.tarifaBase);
        const breakdown: any = {
            tarifaBase: Number(tarifa.tarifaBase),
        };

        // Costo por kilómetro
        const costoPorKm = dto.distanciaKm * Number(tarifa.costoPorKm);
        subtotal += costoPorKm;
        breakdown.costoPorKm = costoPorKm;

        // Costo por kilogramo
        const costoPorKg = dto.pesoKg * Number(tarifa.costoPorKg);
        subtotal += costoPorKg;
        breakdown.costoPorKg = costoPorKg;

        // Recargo por urgencia (porcentaje sobre subtotal)
        if (dto.esUrgente && tarifa.tarifaUrgente) {
            const recargoUrgencia = subtotal * (Number(tarifa.tarifaUrgente) / 100);
            subtotal += recargoUrgencia;
            breakdown.recargoUrgencia = recargoUrgencia;
        }

        // Descuento por volumen (mayor a 100 kg)
        let descuento = 0;
        if (dto.pesoKg > 100 && tarifa.porcentajeDescuentoVolumen > 0) {
            descuento = subtotal * (Number(tarifa.porcentajeDescuentoVolumen) / 100);
            breakdown.descuentoAplicado = descuento;
        }

        const detalles = [
            {
                concepto: 'Servicio de entrega nacional',
                descripcion: `${dto.tipoVehiculo} - ${dto.distanciaKm} km, ${dto.pesoKg} kg${dto.esUrgente ? ' (URGENTE)' : ''}`,
                cantidad: 1,
                precioUnitario: subtotal,
                subtotal,
                descuento,
                total: subtotal - descuento,
            },
        ];

        return {
            subtotal,
            descuento,
            detalles,
            breakdown,
        };
    }
}
