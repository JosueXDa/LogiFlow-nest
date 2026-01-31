import { Injectable } from '@nestjs/common';
import { TariffStrategy, CalculoResult } from './tariff-strategy.interface';
import { Tarifa } from '../entities/tarifa.entity';
import { CalcularTarifaDto } from '../dto/calcular-tarifa.dto';

/**
 * Estrategia de cálculo para entregas intermunicipales
 * - Tarifa base + costo por km + costo por kg
 * - Factor de zona
 */
@Injectable()
export class IntermunicipalTariffStrategy implements TariffStrategy {
    calcular(tarifa: Tarifa, dto: CalcularTarifaDto): CalculoResult {
        let subtotal = Number(tarifa.tarifaBase);
        const breakdown: any = {
            tarifaBase: Number(tarifa.tarifaBase),
        };

        // Costo por kilómetro
        const kmIncluidos = tarifa.kmIncluidos || 0;
        const kmAdicionales = Math.max(0, dto.distanciaKm - kmIncluidos);
        const costoPorKm = kmAdicionales * Number(tarifa.costoPorKm);

        if (costoPorKm > 0) {
            subtotal += costoPorKm;
            breakdown.costoPorKm = costoPorKm;
        }

        // Costo por kilogramo
        const kgIncluidos = tarifa.kgIncluidos || 10;
        const kgAdicionales = Math.max(0, dto.pesoKg - kgIncluidos);
        const costoPorKg = kgAdicionales * Number(tarifa.costoPorKg);

        if (costoPorKg > 0) {
            subtotal += costoPorKg;
            breakdown.costoPorKg = costoPorKg;
        }

        // Factor de zona (multiplicador)
        if (tarifa.factorZona && tarifa.factorZona > 0) {
            const factorZona = Number(tarifa.factorZona);
            subtotal *= factorZona;
            breakdown.factorZona = factorZona;
        }

        // Recargo por urgencia
        if (dto.esUrgente && tarifa.tarifaUrgente) {
            const recargoUrgencia = Number(tarifa.tarifaUrgente);
            subtotal += recargoUrgencia;
            breakdown.recargoUrgencia = recargoUrgencia;
        }

        // Aplicar costo mínimo
        if (tarifa.costoMinimo && subtotal < Number(tarifa.costoMinimo)) {
            subtotal = Number(tarifa.costoMinimo);
            breakdown.costoMinimoAplicado = true;
        }

        const detalles = [
            {
                concepto: 'Servicio de entrega intermunicipal',
                descripcion: `${dto.tipoVehiculo} - ${dto.distanciaKm} km, ${dto.pesoKg} kg${dto.esUrgente ? ' (URGENTE)' : ''}`,
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
