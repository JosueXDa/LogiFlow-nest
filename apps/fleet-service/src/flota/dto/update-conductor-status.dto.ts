import { IsEnum } from 'class-validator';
import { EstadoConductor } from '../entities';

/**
 * DTO para actualizar el estado de un conductor
 */
export class UpdateConductorStatusDto {
  @IsEnum(EstadoConductor)
  estado: EstadoConductor;
}
