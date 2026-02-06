import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsEnum, IsArray, ValidateNested, IsOptional, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoVehiculoPedido, PedidoEstado } from '../enums';

// ==========================================
// UBICACION DTO (nested)
// ==========================================
export class UbicacionDto {
    @ApiProperty({ example: -0.1807, description: 'Latitud' })
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @ApiProperty({ example: -78.4678, description: 'Longitud' })
    @IsNumber()
    @IsNotEmpty()
    lng: number;

    @ApiProperty({ example: 'Av. Principal 123, Quito' })
    @IsString()
    @IsNotEmpty()
    direccion: string;
}

// ==========================================
// ITEM PEDIDO DTO (nested)
// ==========================================
export class ItemPedidoDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsString()
    @IsNotEmpty()
    productoId: string;

    @ApiPropertyOptional({ example: 'Laptop Dell XPS 15' })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiPropertyOptional({ example: 2.5, description: 'Peso del item en kg' })
    @IsNumber()
    @IsOptional()
    peso?: number;

    @ApiProperty({ example: 2, minimum: 1 })
    @IsNumber()
    @Min(1)
    cantidad: number;
}

// ==========================================
// CREATE PEDIDO
// ==========================================
export class CreatePedidoDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    @IsString()
    @IsNotEmpty()
    clienteId: string;

    @ApiProperty({ type: UbicacionDto })
    @ValidateNested()
    @Type(() => UbicacionDto)
    origen: UbicacionDto;

    @ApiProperty({ type: UbicacionDto })
    @ValidateNested()
    @Type(() => UbicacionDto)
    destino: UbicacionDto;

    @ApiProperty({ enum: TipoVehiculoPedido, example: TipoVehiculoPedido.MOTO })
    @IsEnum(TipoVehiculoPedido)
    tipoVehiculo: TipoVehiculoPedido;

    @ApiProperty({ type: [ItemPedidoDto], description: 'Lista de items del pedido' })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ItemPedidoDto)
    items: ItemPedidoDto[];
}

// ==========================================
// CANCEL PEDIDO
// ==========================================
export class CancelPedidoDto {
    @ApiProperty({ example: 'Cliente solicitó cancelación', description: 'Razón de la cancelación' })
    @IsString()
    @IsNotEmpty()
    razon: string;
}

// ==========================================
// UPDATE ESTADO
// ==========================================
export class UpdateEstadoDto {
    @ApiProperty({
        enum: [PedidoEstado.EN_RUTA, PedidoEstado.ENTREGADO],
        example: PedidoEstado.EN_RUTA,
        description: 'Solo se permite EN_RUTA o ENTREGADO'
    })
    @IsEnum(PedidoEstado)
    nuevoEstado: PedidoEstado.EN_RUTA | PedidoEstado.ENTREGADO;

    @ApiPropertyOptional({ example: 'https://storage.example.com/evidencia.jpg', description: 'URL de la evidencia de entrega' })
    @IsString()
    @IsOptional()
    evidenciaEntrega?: string;
}
