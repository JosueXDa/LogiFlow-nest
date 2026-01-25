import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  pesoKg?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stockTotal?: number;
}
