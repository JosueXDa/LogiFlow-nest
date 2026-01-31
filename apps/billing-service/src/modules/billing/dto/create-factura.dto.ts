import {
    IsUUID,
    IsString,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsOptional,
    Min,
    Max,
    Length,
} from 'class-validator';
import { TipoEntrega, TipoVehiculo } from '../entities/tarifa.entity';

export class CreateFacturaDto {
    @IsUUID()
    pedidoId: string;

    @IsUUID()
    clienteId: string;

    @IsString()
    @Length(1, 200)
    clienteNombre: string;

    @IsOptional()
    @IsString()
    @Length(10, 13)
    clienteRuc?: string;

    @IsOptional()
    @IsString()
    @Length(1, 500)
    clienteDireccion?: string;

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

    @IsOptional()
    @IsString()
    zonaNombre?: string;
}
