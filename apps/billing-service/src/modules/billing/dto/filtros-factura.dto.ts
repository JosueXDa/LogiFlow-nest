import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { EstadoFactura } from '../entities/factura.entity';
import { Type } from 'class-transformer';

export class FiltrosFacturaDto {
    @IsOptional()
    @IsEnum(EstadoFactura)
    estado?: EstadoFactura;

    @IsOptional()
    @IsUUID()
    clienteId?: string;

    @IsOptional()
    @IsUUID()
    zonaId?: string;

    @IsOptional()
    @IsDateString()
    fechaDesde?: string;

    @IsOptional()
    @IsDateString()
    fechaHasta?: string;

    @IsOptional()
    @Type(() => Number)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    limit?: number = 10;
}
