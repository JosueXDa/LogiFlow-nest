import {
    IsEnum,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsUUID,
    Min,
    Max,
} from 'class-validator';
import { TipoEntrega, TipoVehiculo } from '../entities/tarifa.entity';

export class CalcularTarifaDto {
    @IsEnum(TipoEntrega)
    tipoEntrega: TipoEntrega;

    @IsEnum(TipoVehiculo)
    tipoVehiculo: TipoVehiculo;

    @IsNumber()
    @Min(0)
    @Max(10000)
    distanciaKm: number;

    @IsNumber()
    @Min(0)
    @Max(50000)
    pesoKg: number;

    @IsBoolean()
    esUrgente: boolean;

    @IsOptional()
    @IsUUID()
    zonaId?: string;
}
