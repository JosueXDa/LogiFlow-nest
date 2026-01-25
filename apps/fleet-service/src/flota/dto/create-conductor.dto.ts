import {
  IsString,
  IsUUID,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateVehiculoDto } from './create-vehiculo.dto';

/**
 * DTO para registrar un nuevo conductor en el sistema
 */
export class CreateConductorDto {
  @IsUUID()
  usuarioId: string;

  @IsString()
  nombre: string;

  @IsString()
  zonaOperacionId: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud?: number;

  @ValidateNested()
  @Type(() => CreateVehiculoDto)
  vehiculo: CreateVehiculoDto;
}
