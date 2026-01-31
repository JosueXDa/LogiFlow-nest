import { Injectable } from '@nestjs/common';
import { TariffStrategy, CalculoResult } from './tariff-strategy.interface';
import { Tarifa } from '../entities/tarifa.entity';
import { CalcularTarifaDto } from '../dto/calcular-tarifa.dto';

/**
 * Estrategia de cálculo para entregas urbanas (última milla)
 * - Tarifa base + costo por km adicional (más de 5 km)
 * - Recargo por urgencia
 */
@Injectable()
export class UrbanTariffStrategy implements TariffStrategy {
    calcular(tarifa: Tarifa, dto: CalcularTarifaDto): CalculoResult {
        let subtotal = Number(tarifa.tarifaBase);
        const breakdown: any = {
            tarifaBase: Number(tarifa.tarifaBase),
        };

        // Costo por kilómetro (solo si excede los km incluidos)
        const kmIncluidos = tarifa.kmIncluidos || 5;
        const kmAdicionales = Math.max(0, dto.distanciaKm - kmIncluidos);
        const costoPorKm = kmAdicionales * Number(tarifa.costoPorKm);

        if (costoPorKm > 0) {
            subtotal += costoPorKm;
            breakdown.costoPorKm = costoPorKm;
        }

        // Recargo por urgencia (tarifa plana)
        if (dto.esUrgente && tarifa.tarifaUrgente) {
            const recargoUrgencia = Number(tarifa.tarifaUrgente);
            subtotal += recargoUrgencia;
            breakdown.recargoUrgencia = recargoUrgencia;
        }

        // Aplicar costo mínimo si aplica
        if (tarifa.costoMinimo && subtotal < Number(tarifa.costoMinimo)) {
            subtotal = Number(tarifa.costoMinimo);
            breakdown.costoMinimoAplicado = true;
        }

        // Crear detalle de factura
        const detalles = [
            {
                concepto: 'Servicio de entrega urbana',
                descripcion: `${dto.tipoVehiculo} - ${dto.distanciaKm} km${dto.esUrgente ? ' (URGENTE)' : ''}`,
                cantidad: 1,
                precioUnitario: subtotal,
                subtotal,
                descuento: 0,
                total: subtotal,
            },
        ];

        return {
            subtotal,
            descuento: 0,
            detalles,
            breakdown,
        };
    }
}
