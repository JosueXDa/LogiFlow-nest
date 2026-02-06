import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoVehiculo, TipoEntrega, TipoLicencia, EstadoRepartidor, EstadoVehiculo } from '../enums';

// ==========================================
// REPARTIDOR DTOs
// ==========================================
export class CreateRepartidorDto {
    @ApiProperty({ example: 'Juan', minLength: 2, maxLength: 100 })
    nombre: string;

    @ApiProperty({ example: 'Pérez', minLength: 2, maxLength: 100 })
    apellido: string;

    @ApiProperty({ example: '1234567890', description: 'Cédula de 10 dígitos' })
    cedula: string;

    @ApiProperty({ example: '+593987654321', description: 'Formato: +593XXXXXXXXX' })
    telefono: string;

    @ApiProperty({ example: 'juan.perez@email.com' })
    email: string;

    @ApiProperty({ example: 'LIC-12345' })
    licencia: string;

    @ApiProperty({ enum: TipoLicencia, example: TipoLicencia.B })
    tipoLicencia: TipoLicencia;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    zonaId: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
    vehiculoId?: string;
}

export class UpdateRepartidorDto {
    @ApiPropertyOptional({ example: 'Juan' })
    nombre?: string;

    @ApiPropertyOptional({ example: 'Pérez' })
    apellido?: string;

    @ApiPropertyOptional({ example: '+593987654321' })
    telefono?: string;

    @ApiPropertyOptional({ example: 'juan.perez@email.com' })
    email?: string;

    @ApiPropertyOptional({ example: 'LIC-12345' })
    licencia?: string;

    @ApiPropertyOptional({ enum: TipoLicencia })
    tipoLicencia?: TipoLicencia;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
    zonaId?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001' })
    vehiculoId?: string;
}

export class CambiarEstadoRepartidorDto {
    @ApiProperty({ enum: EstadoRepartidor, example: EstadoRepartidor.DISPONIBLE })
    estado: string;

    @ApiPropertyOptional({ example: 'Inicio de jornada laboral' })
    motivo?: string;
}

export class FindRepartidoresQueryDto {
    @ApiPropertyOptional({ example: 1, default: 1 })
    page?: number;

    @ApiPropertyOptional({ example: 10, default: 10 })
    limit?: number;

    @ApiPropertyOptional({ enum: EstadoRepartidor })
    estado?: string;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
    zonaId?: string;
}

// ==========================================
// VEHICULO DTOs
// ==========================================
export class CreateVehiculoDto {
    @ApiProperty({ enum: TipoVehiculo, example: TipoVehiculo.MOTORIZADO })
    tipo: TipoVehiculo;

    @ApiProperty({ example: 'ABC-1234' })
    placa: string;

    @ApiProperty({ example: 'Honda' })
    marca: string;

    @ApiProperty({ example: 'CBR 150' })
    modelo: string;

    @ApiProperty({ example: 2023, minimum: 2000 })
    año: number;

    @ApiProperty({ example: 'Rojo' })
    color: string;

    @ApiProperty({ example: 50, description: 'Capacidad en kg' })
    capacidadKg: number;

    @ApiProperty({ example: 0.5, description: 'Capacidad en m³' })
    capacidadM3: number;

    @ApiPropertyOptional({ example: 150, description: 'Cilindrada en cc (solo motorizado)' })
    cilindradaCc?: number;

    @ApiPropertyOptional({ example: true, description: 'Tiene top case (solo motorizado)' })
    tieneTopCase?: boolean;

    @ApiPropertyOptional({ example: 4, description: 'Número de puertas (solo vehículo liviano)' })
    numeroPuertas?: number;

    @ApiPropertyOptional({ example: false, description: 'Es pickup (solo vehículo liviano)' })
    esPickup?: boolean;

    @ApiPropertyOptional({ example: 'FURGON', description: 'Tipo de camión (solo camión)' })
    tipoCamion?: string;

    @ApiPropertyOptional({ example: 2, description: 'Número de ejes (solo camión)' })
    numeroEjes?: number;
}

export class UpdateVehiculoDto {
    @ApiPropertyOptional({ example: 'Azul' })
    color?: string;

    @ApiPropertyOptional({ enum: EstadoVehiculo })
    estado?: EstadoVehiculo;

    @ApiPropertyOptional({ example: 50000, description: 'Kilometraje actual' })
    kilometraje?: number;

    @ApiPropertyOptional({ example: 25, description: 'Carga actual en kg' })
    cargaActualKg?: number;

    @ApiPropertyOptional({ example: 0.3, description: 'Volumen actual en m³' })
    volumenActualM3?: number;
}

export class FindVehiculosQueryDto {
    @ApiPropertyOptional({ example: 1, default: 1 })
    page?: number;

    @ApiPropertyOptional({ example: 10, default: 10 })
    limit?: number;

    @ApiPropertyOptional({ example: 'ABC' })
    placa?: string;

    @ApiPropertyOptional({ enum: TipoVehiculo })
    tipo?: string;

    @ApiPropertyOptional({ enum: EstadoVehiculo })
    estado?: string;
}

// ==========================================
// ZONA DTOs
// ==========================================
export class CreateZonaDto {
    @ApiProperty({ example: 'Zona Norte' })
    nombre: string;

    @ApiPropertyOptional({ example: 'Cobertura del sector norte de la ciudad' })
    descripcion?: string;

    @ApiPropertyOptional({ example: '-0.1807,-78.4678;-0.1900,-78.4800', description: 'Coordenadas del polígono' })
    coordenadas?: string;
}

export class UpdateZonaDto {
    @ApiPropertyOptional({ example: 'Zona Norte Actualizada' })
    nombre?: string;

    @ApiPropertyOptional({ example: 'Nueva descripción' })
    descripcion?: string;

    @ApiPropertyOptional({ example: '-0.1807,-78.4678;-0.1900,-78.4800' })
    coordenadas?: string;
}

// ==========================================
// ASIGNACION DTOs
// ==========================================
export class AsignarRepartidorDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    pedidoId: string;

    @ApiProperty({ enum: TipoEntrega, example: TipoEntrega.URBANA })
    tipoEntrega: TipoEntrega;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    zonaId: string;

    @ApiProperty({ example: 10, description: 'Peso en kg' })
    pesoKg: number;

    @ApiProperty({ example: 0.5, description: 'Volumen en m³' })
    volumenM3: number;

    @ApiProperty({ example: -0.1807 })
    origenLat: number;

    @ApiProperty({ example: -78.4678 })
    origenLng: number;

    @ApiProperty({ example: -0.1900 })
    destinoLat: number;

    @ApiProperty({ example: -78.4800 })
    destinoLng: number;
}

export class FinalizarAsignacionDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;

    @ApiPropertyOptional({ example: 'Entrega completada sin novedades' })
    observaciones?: string;
}

// ==========================================
// DISPONIBILIDAD Query
// ==========================================
export class DisponibilidadQueryDto {
    @ApiPropertyOptional({ enum: TipoVehiculo })
    tipoVehiculo?: string;
}
