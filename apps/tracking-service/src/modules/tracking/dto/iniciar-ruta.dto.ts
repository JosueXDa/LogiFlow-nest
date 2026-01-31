import { IsUUID, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class IniciarRutaDto {
    @IsUUID()
    @IsNotEmpty()
    pedidoId: string;

    @IsUUID()
    @IsNotEmpty()
    repartidorId: string;

    @IsNumber()
    @IsNotEmpty()
    origenLat: number;

    @IsNumber()
    @IsNotEmpty()
    origenLng: number;

    @IsString()
    @IsOptional()
    origenDireccion?: string;

    @IsNumber()
    @IsNotEmpty()
    destinoLat: number;

    @IsNumber()
    @IsNotEmpty()
    destinoLng: number;

    @IsString()
    @IsOptional()
    destinoDireccion?: string;
}
