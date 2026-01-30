import { IsEnum, IsString, IsOptional, Length } from 'class-validator';
import { TipoPago } from '../entities/factura.entity';

export class UpdateFacturaDto {
    @IsOptional()
    @IsEnum(TipoPago)
    tipoPago?: TipoPago;

    @IsOptional()
    @IsString()
    @Length(1, 100)
    referenciaPago?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}
