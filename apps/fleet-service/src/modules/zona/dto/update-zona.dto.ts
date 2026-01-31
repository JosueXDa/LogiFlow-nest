import { IsOptional, IsString } from 'class-validator';

export class UpdateZonaDto {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsString()
    @IsOptional()
    descripcion?: string;

    @IsString()
    @IsOptional()
    coordenadas?: string;
}
