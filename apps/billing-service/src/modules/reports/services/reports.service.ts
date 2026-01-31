import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Factura, EstadoFactura } from '../../billing/entities/factura.entity';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Factura)
        private readonly facturaRepository: Repository<Factura>,
    ) { }

    /**
     * Reporte de facturación por tipo de vehículo
     */
    async reportePorTipoVehiculo(fechaDesde: Date, fechaHasta: Date) {
        const query = `
      SELECT 
        (metadata->>'tipoVehiculo') as tipo_vehiculo,
        COUNT(*) as cantidad_facturas,
        SUM(total::numeric) as total_facturado,
        AVG(total::numeric) as promedio_factura,
        SUM(CASE WHEN estado = 'PAGADA' THEN total::numeric ELSE 0 END) as total_pagado
      FROM facturas
      WHERE created_at BETWEEN $1 AND $2
        AND estado != 'ANULADA'
      GROUP BY (metadata->>'tipoVehiculo')
      ORDER BY total_facturado DESC
    `;

        return await this.facturaRepository.query(query, [fechaDesde, fechaHasta]);
    }

    /**
     * Reporte de facturación por zona
     */
    async reportePorZona(fechaDesde: Date, fechaHasta: Date) {
        const query = `
      SELECT 
        zona_id,
        zona_nombre,
        COUNT(*) as cantidad_facturas,
        SUM(total::numeric) as total_facturado,
        AVG(total::numeric) as promedio_factura
      FROM facturas
      WHERE created_at BETWEEN $1 AND $2
        AND estado != 'ANULADA'
        AND zona_id IS NOT NULL
      GROUP BY zona_id, zona_nombre
      ORDER BY total_facturado DESC
    `;

        return await this.facturaRepository.query(query, [fechaDesde, fechaHasta]);
    }

    /**
     * Reporte de estado de facturas
     */
    async reporteEstadoFacturas(mes: number, año: number) {
        const fechaInicio = new Date(año, mes - 1, 1);
        const fechaFin = new Date(año, mes, 0, 23, 59, 59);

        const facturas = await this.facturaRepository.find({
            where: {
                createdAt: Between(fechaInicio, fechaFin),
            },
        });

        const resumen = {
            mes,
            año,
            estadisticas: {
                total: facturas.length,
                borrador: facturas.filter((f) => f.estado === EstadoFactura.BORRADOR)
                    .length,
                emitida: facturas.filter((f) => f.estado === EstadoFactura.EMITIDA)
                    .length,
                pagada: facturas.filter((f) => f.estado === EstadoFactura.PAGADA).length,
                anulada: facturas.filter((f) => f.estado === EstadoFactura.ANULADA)
                    .length,
            },
            montos: {
                totalFacturado: facturas.reduce((sum, f) => sum + Number(f.total), 0),
                totalPagado: facturas
                    .filter((f) => f.estado === EstadoFactura.PAGADA)
                    .reduce((sum, f) => sum + Number(f.total), 0),
                pendienteCobro: facturas
                    .filter((f) => f.estado === EstadoFactura.EMITIDA)
                    .reduce((sum, f) => sum + Number(f.total), 0),
            },
        };

        return resumen;
    }
}
