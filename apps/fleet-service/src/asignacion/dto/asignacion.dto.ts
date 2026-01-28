import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsUUID,
    Min,
    IsOptional,
} from 'class-validator';
import { TipoEntrega } from '../../common/enums';

export class AsignarRepartidorDto {
    @IsUUID()
    pedidoId: string;

    @IsEnum(TipoEntrega)
    tipoEntrega: TipoEntrega;

    @IsUUID()
    zonaId: string;

    @IsNumber()
    @Min(0)
    pesoKg: number;

    @IsNumber()
    @Min(0)
    volumenM3: number;

    @IsNumber()
    origenLat: number;

    @IsNumber()
    origenLng: number;

    @IsNumber()
    destinoLat: number;

    @IsNumber()
    destinoLng: number;
}

export class FinalizarAsignacionDto {
    @IsUUID()
    id: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}
