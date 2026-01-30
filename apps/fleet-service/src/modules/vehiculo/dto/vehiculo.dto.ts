import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsOptional,
    Min,
    Max,
    ValidateIf,
    IsBoolean,
} from 'class-validator';
import { TipoVehiculo, EstadoVehiculo } from '../../../common/enums';

export class CreateVehiculoDto {
    @IsEnum(TipoVehiculo)
    tipo: TipoVehiculo;

    @IsString()
    @IsNotEmpty()
    placa: string;

    @IsString()
    @IsNotEmpty()
    marca: string;

    @IsString()
    @IsNotEmpty()
    modelo: string;

    @IsNumber()
    @Min(2000)
    @Max(new Date().getFullYear() + 1)
    año: number;

    @IsString()
    @IsNotEmpty()
    color: string;

    @IsNumber()
    @Min(0)
    capacidadKg: number;

    @IsNumber()
    @Min(0)
    capacidadM3: number;

    // Campos específicos de Motorizado
    @ValidateIf((o) => o.tipo === TipoVehiculo.MOTORIZADO)
    @IsNumber()
    @IsOptional()
    cilindradaCc?: number;

    @ValidateIf((o) => o.tipo === TipoVehiculo.MOTORIZADO)
    @IsBoolean()
    @IsOptional()
    tieneTopCase?: boolean;

    // Campos específicos de VehiculoLiviano
    @ValidateIf((o) => o.tipo === TipoVehiculo.VEHICULO_LIVIANO)
    @IsNumber()
    @IsOptional()
    numeroPuertas?: number;

    @ValidateIf((o) => o.tipo === TipoVehiculo.VEHICULO_LIVIANO)
    @IsBoolean()
    @IsOptional()
    esPickup?: boolean;

    // Campos específicos de Camion
    @ValidateIf((o) => o.tipo === TipoVehiculo.CAMION)
    @IsString()
    @IsOptional()
    tipoCamion?: string;

    @ValidateIf((o) => o.tipo === TipoVehiculo.CAMION)
    @IsNumber()
    @IsOptional()
    numeroEjes?: number;
}

export class UpdateVehiculoDto {
    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsEnum(EstadoVehiculo)
    estado?: EstadoVehiculo;

    @IsOptional()
    @IsNumber()
    kilometraje?: number;

    @IsOptional()
    @IsNumber()
    cargaActualKg?: number;

    @IsOptional()
    @IsNumber()
    volumenActualM3?: number;

    // More fields could be added as needed
}

export class FindVehiculosDto {
    @IsOptional()
    @IsEnum(TipoVehiculo)
    tipo?: TipoVehiculo;

    @IsOptional()
    @IsEnum(EstadoVehiculo)
    estado?: EstadoVehiculo;
}
