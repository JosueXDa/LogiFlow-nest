import {
  IsEnum,
  IsNumber,
  IsString,
  Min,
  IsOptional,
  IsInt,
} from 'class-validator';
import { TipoVehiculo } from '../entities';

/**
 * DTO para crear un vehículo
 * Usado en conjunto con CreateConductorDto
 */
export class CreateVehiculoDto {
  @IsString()
  placa: string;

  @IsString()
  modelo: string;

  @IsEnum(TipoVehiculo)
  tipo: TipoVehiculo;

  @IsNumber()
  @Min(0)
  capacidadKg: number;

  // Campos específicos opcionales por tipo de vehículo
  @IsOptional()
  @IsString()
  cilindraje?: string; // Para motos

  @IsOptional()
  @IsInt()
  numeroPuertas?: number; // Para vehículos livianos

  @IsOptional()
  @IsString()
  tipoCarroceria?: string; // Para vehículos livianos

  @IsOptional()
  @IsInt()
  numeroEjes?: number; // Para camiones

  @IsOptional()
  @IsNumber()
  volumenM3?: number; // Para camiones
}
