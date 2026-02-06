import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoEntrega, TipoVehiculo, EstadoFactura, TipoPago } from '../enums';

// ==========================================
// CALCULAR TARIFA
// ==========================================
export class CalcularTarifaDto {
    @ApiProperty({ enum: TipoEntrega, example: TipoEntrega.URBANA })
    tipoEntrega: TipoEntrega;

    @ApiProperty({ enum: TipoVehiculo, example: TipoVehiculo.MOTORIZADO })
    tipoVehiculo: TipoVehiculo;

    @ApiProperty({ example: 5.5, description: 'Distancia en kilómetros' })
    distanciaKm: number;

    @ApiProperty({ example: 10, description: 'Peso en kilogramos' })
    pesoKg: number;

    @ApiProperty({ example: false, description: 'Si es entrega urgente' })
    esUrgente: boolean;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID de la zona' })
    zonaId?: string;
}

// ==========================================
// CREATE FACTURA
// ==========================================
export class CreateFacturaDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    pedidoId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    clienteId: string;

    @ApiProperty({ example: 'Juan Pérez' })
    clienteNombre: string;

    @ApiPropertyOptional({ example: '1234567890001', description: 'RUC del cliente' })
    clienteRuc?: string;

    @ApiPropertyOptional({ example: 'Av. Principal 123' })
    clienteDireccion?: string;

    @ApiProperty({ enum: TipoEntrega, example: TipoEntrega.URBANA })
    tipoEntrega: TipoEntrega;

    @ApiProperty({ enum: TipoVehiculo, example: TipoVehiculo.MOTORIZADO })
    tipoVehiculo: TipoVehiculo;

    @ApiProperty({ example: 5.5 })
    distanciaKm: number;

    @ApiProperty({ example: 10 })
    pesoKg: number;

    @ApiProperty({ example: false })
    esUrgente: boolean;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002' })
    zonaId?: string;

    @ApiPropertyOptional({ example: 'Zona Norte' })
    zonaNombre?: string;
}

// ==========================================
// FILTROS FACTURA (Query)
// ==========================================
export class FiltrosFacturaDto {
    @ApiPropertyOptional({ enum: EstadoFactura, description: 'Estado de la factura' })
    estado?: EstadoFactura;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
    clienteId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002' })
    zonaId?: string;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Fecha desde (YYYY-MM-DD)' })
    fechaDesde?: string;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'Fecha hasta (YYYY-MM-DD)' })
    fechaHasta?: string;

    @ApiPropertyOptional({ example: 1, default: 1 })
    page?: number;

    @ApiPropertyOptional({ example: 10, default: 10 })
    limit?: number;
}

// ==========================================
// REGISTRAR PAGO
// ==========================================
export class RegistrarPagoDto {
    @ApiPropertyOptional({ enum: TipoPago, example: TipoPago.EFECTIVO })
    tipoPago?: TipoPago;

    @ApiPropertyOptional({ example: 'REF-123456', description: 'Referencia del pago' })
    referenciaPago?: string;

    @ApiPropertyOptional({ example: 'Pago recibido en efectivo' })
    observaciones?: string;
}

// ==========================================
// CANCELAR FACTURA
// ==========================================
export class CancelarFacturaDto {
    @ApiProperty({ example: 'Cliente solicitó cancelación', description: 'Motivo de la cancelación' })
    motivo: string;
}

// ==========================================
// REPORTE DIARIO (Query)
// ==========================================
export class DailyReportQueryDto {
    @ApiProperty({ example: '2024-01-15', description: 'Fecha del reporte (YYYY-MM-DD)' })
    date: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'Filtrar por zona' })
    zonaId?: string;
}
