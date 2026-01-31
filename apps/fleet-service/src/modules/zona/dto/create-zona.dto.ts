import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateZonaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    coordenadas?: string;
}
