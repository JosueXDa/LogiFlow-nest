import {
    IsUUID,
    IsNotEmpty,
    IsNumber,
    Min,
    Max,
    IsOptional,
    IsString,
} from 'class-validator';

export class UpdateLocationDto {
    @IsUUID()
    @IsNotEmpty()
    repartidorId: string;

    @IsUUID()
    @IsOptional()
    pedidoId?: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    @IsNotEmpty()
    latitud: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    @IsNotEmpty()
    longitud: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    velocidadKmh?: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    precision?: number;

    @IsNumber()
    @IsOptional()
    altitud?: number;

    @IsNumber()
    @Min(0)
    @Max(360)
    @IsOptional()
    rumbo?: number;

    @IsString()
    @IsOptional()
    dispositivoId?: string;

    @IsString()
    @IsOptional()
    tipoConexion?: string;
}
