import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoVehiculoPedido, PedidoEstado } from '../enums';

// ==========================================
// UBICACION DTO (nested)
// ==========================================
export class UbicacionDto {
    @ApiProperty({ example: -0.1807, description: 'Latitud' })
    lat: number;

    @ApiProperty({ example: -78.4678, description: 'Longitud' })
    lng: number;

    @ApiProperty({ example: 'Av. Principal 123, Quito' })
    direccion: string;
}

// ==========================================
// ITEM PEDIDO DTO (nested)
// ==========================================
export class ItemPedidoDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    productoId: string;

    @ApiPropertyOptional({ example: 'Laptop Dell XPS 15' })
    descripcion?: string;

    @ApiPropertyOptional({ example: 2.5, description: 'Peso del item en kg' })
    peso?: number;

    @ApiProperty({ example: 2, minimum: 1 })
    cantidad: number;
}

// ==========================================
// CREATE PEDIDO
// ==========================================
export class CreatePedidoDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
    clienteId: string;

    @ApiProperty({ type: UbicacionDto })
    origen: UbicacionDto;

    @ApiProperty({ type: UbicacionDto })
    destino: UbicacionDto;

    @ApiProperty({ enum: TipoVehiculoPedido, example: TipoVehiculoPedido.MOTO })
    tipoVehiculo: TipoVehiculoPedido;

    @ApiProperty({ type: [ItemPedidoDto], description: 'Lista de items del pedido' })
    items: ItemPedidoDto[];
}

// ==========================================
// CANCEL PEDIDO
// ==========================================
export class CancelPedidoDto {
    @ApiProperty({ example: 'Cliente solicitó cancelación', description: 'Razón de la cancelación' })
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
    nuevoEstado: PedidoEstado.EN_RUTA | PedidoEstado.ENTREGADO;

    @ApiPropertyOptional({ example: 'https://storage.example.com/evidencia.jpg', description: 'URL de la evidencia de entrega' })
    evidenciaEntrega?: string;
}
