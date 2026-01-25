import { IsString, IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class ReserveStockDto {
  @IsUUID()
  @IsNotEmpty()
  productoId: string;

  @IsString()
  @IsNotEmpty()
  pedidoId: string;

  @IsNumber()
  @Min(1)
  cantidad: number;
}
