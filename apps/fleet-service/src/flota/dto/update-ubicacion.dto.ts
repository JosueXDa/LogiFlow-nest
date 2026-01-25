import { IsNumber, Min, Max } from 'class-validator';

/**
 * DTO para actualizar la ubicación de un conductor
 */
export class UpdateUbicacionDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitud: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitud: number;
}
