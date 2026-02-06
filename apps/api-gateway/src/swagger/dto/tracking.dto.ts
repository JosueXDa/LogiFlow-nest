import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==========================================
// UPDATE LOCATION
// ==========================================
export class UpdateLocationDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    repartidorId: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
    pedidoId?: string;

    @ApiProperty({ example: -0.1807, minimum: -90, maximum: 90 })
    latitud: number;

    @ApiProperty({ example: -78.4678, minimum: -180, maximum: 180 })
    longitud: number;

    @ApiPropertyOptional({ example: 35, minimum: 0, description: 'Velocidad en km/h' })
    velocidadKmh?: number;

    @ApiPropertyOptional({ example: 10, minimum: 0, description: 'Precisión en metros' })
    precision?: number;

    @ApiPropertyOptional({ example: 2850, description: 'Altitud en metros' })
    altitud?: number;

    @ApiPropertyOptional({ example: 180, minimum: 0, maximum: 360, description: 'Rumbo en grados' })
    rumbo?: number;

    @ApiPropertyOptional({ example: 'device-123' })
    dispositivoId?: string;

    @ApiPropertyOptional({ example: '4G' })
    tipoConexion?: string;
}

// ==========================================
// INICIAR RUTA
// ==========================================
export class IniciarRutaDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    pedidoId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    repartidorId: string;

    @ApiProperty({ example: -0.1807 })
    origenLat: number;

    @ApiProperty({ example: -78.4678 })
    origenLng: number;

    @ApiPropertyOptional({ example: 'Av. Principal 123' })
    origenDireccion?: string;

    @ApiProperty({ example: -0.1900 })
    destinoLat: number;

    @ApiProperty({ example: -78.4800 })
    destinoLng: number;

    @ApiPropertyOptional({ example: 'Calle Secundaria 456' })
    destinoDireccion?: string;
}

// ==========================================
// HISTORIAL QUERY
// ==========================================
export class HistorialQueryDto {
    @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: 'Fecha desde (ISO 8601)' })
    fechaDesde?: string;

    @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z', description: 'Fecha hasta (ISO 8601)' })
    fechaHasta?: string;

    @ApiPropertyOptional({ example: 100, minimum: 1, default: 100, description: 'Límite de registros' })
    limit?: number;
}
