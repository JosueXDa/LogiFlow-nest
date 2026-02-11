import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

// ==========================================
// UPDATE LOCATION
// ==========================================
export class UpdateLocationDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    @IsNotEmpty()
    repartidorId: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    @IsOptional()
    pedidoId?: string;

    @ApiProperty({ example: -0.1807, minimum: -90, maximum: 90 })
    @IsNumber()
    @Min(-90)
    @Max(90)
    @IsNotEmpty()
    latitud: number;

    @ApiProperty({ example: -78.4678, minimum: -180, maximum: 180 })
    @IsNumber()
    @Min(-180)
    @Max(180)
    @IsNotEmpty()
    longitud: number;

    @ApiPropertyOptional({ example: 35, minimum: 0, description: 'Velocidad en km/h' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    velocidadKmh?: number;

    @ApiPropertyOptional({ example: 10, minimum: 0, description: 'Precisión en metros' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    precision?: number;

    @ApiPropertyOptional({ example: 2850, description: 'Altitud en metros' })
    @IsNumber()
    @IsOptional()
    altitud?: number;

    @ApiPropertyOptional({ example: 180, minimum: 0, maximum: 360, description: 'Rumbo en grados' })
    @IsNumber()
    @Min(0)
    @Max(360)
    @IsOptional()
    rumbo?: number;

    @ApiPropertyOptional({ example: 'device-123' })
    @IsString()
    @IsOptional()
    dispositivoId?: string;

    @ApiPropertyOptional({ example: '4G' })
    @IsString()
    @IsOptional()
    tipoConexion?: string;
}

// ==========================================
// INICIAR RUTA
// ==========================================
export class IniciarRutaDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    @IsNotEmpty()
    pedidoId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsUUID()
    @IsNotEmpty()
    repartidorId: string;

    @ApiProperty({ example: -0.1807 })
    @IsNumber()
    @Min(-90)
    @Max(90)
    @IsNotEmpty()
    origenLat: number;

    @ApiProperty({ example: -78.4678 })
    @IsNumber()
    @Min(-180)
    @Max(180)
    @IsNotEmpty()
    origenLng: number;

    @ApiPropertyOptional({ example: 'Av. Principal 123' })
    @IsString()
    @IsOptional()
    origenDireccion?: string;

    @ApiProperty({ example: -0.1900 })
    @IsNumber()
    @Min(-90)
    @Max(90)
    @IsNotEmpty()
    destinoLat: number;

    @ApiProperty({ example: -78.4800 })
    @IsNumber()
    @Min(-180)
    @Max(180)
    @IsNotEmpty()
    destinoLng: number;

    @ApiPropertyOptional({ example: 'Calle Secundaria 456' })
    @IsString()
    @IsOptional()
    destinoDireccion?: string;
}

// ==========================================
// HISTORIAL QUERY
// ==========================================
export class HistorialQueryDto {
    @ApiPropertyOptional({ example: '2024-01-01T00:00:00Z', description: 'Fecha desde (ISO 8601)' })
    @IsString()
    @IsOptional()
    fechaDesde?: string;

    @ApiPropertyOptional({ example: '2024-12-31T23:59:59Z', description: 'Fecha hasta (ISO 8601)' })
    @IsString()
    @IsOptional()
    fechaHasta?: string;

    @ApiPropertyOptional({ example: 100, minimum: 1, default: 100, description: 'Límite de registros' })
    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number;
}
