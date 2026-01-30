import { IsDateString, IsOptional, IsEnum } from 'class-validator';

export enum ReportType {
    VEHICULO = 'VEHICULO',
    ZONA = 'ZONA',
    ESTADO = 'ESTADO',
}

export class GenerateReportDto {
    @IsEnum(ReportType)
    tipo: ReportType;

    @IsDateString()
    fechaDesde: string;

    @IsDateString()
    fechaHasta: string;

    @IsOptional()
    zonaId?: string;
}
