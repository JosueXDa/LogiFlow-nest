import { IsUUID, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';

export class HistorialQueryDto {
    @IsUUID()
    repartidorId: string;

    @IsDateString()
    @IsOptional()
    fechaDesde?: Date;

    @IsDateString()
    @IsOptional()
    fechaHasta?: Date;

    @IsNumber()
    @Min(1)
    @IsOptional()
    limit?: number = 100;
}
