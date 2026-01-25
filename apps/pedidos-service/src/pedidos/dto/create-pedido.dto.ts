import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoVehiculo } from '../entities';

export class UbicacionDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsString()
  @IsNotEmpty()
  direccion: string;
}

export class ItemPedidoDto {
  @IsUUID()
  @IsNotEmpty()
  productoId: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsOptional()
  peso?: number;

  @IsInt()
  @Min(1)
  cantidad: number;
}

export class CreatePedidoDto {
  @IsUUID()
  clienteId: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UbicacionDto)
  origen: UbicacionDto;

  @IsObject()
  @ValidateNested()
  @Type(() => UbicacionDto)
  destino: UbicacionDto;

  @IsEnum(TipoVehiculo)
  tipoVehiculo: TipoVehiculo;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  items: ItemPedidoDto[];
}
