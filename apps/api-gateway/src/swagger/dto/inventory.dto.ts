import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==========================================
// CREATE PRODUCT
// ==========================================
export class CreateProductDto {
    @ApiProperty({ example: 'SKU-001', description: 'Código único del producto' })
    sku: string;

    @ApiProperty({ example: 'Laptop Dell XPS 15' })
    nombre: string;

    @ApiPropertyOptional({ example: 'Laptop de alto rendimiento con procesador Intel Core i7' })
    descripcion?: string;

    @ApiProperty({ example: 1299.99, minimum: 0 })
    precio: number;

    @ApiProperty({ example: 2.5, minimum: 0, description: 'Peso en kg' })
    pesoKg: number;

    @ApiProperty({ example: 100, minimum: 0, description: 'Stock inicial' })
    stockTotal: number;
}

// ==========================================
// UPDATE PRODUCT
// ==========================================
export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Laptop Dell XPS 15 Pro' })
    nombre?: string;

    @ApiPropertyOptional({ example: 'Descripción actualizada' })
    descripcion?: string;

    @ApiPropertyOptional({ example: 1399.99, minimum: 0 })
    precio?: number;

    @ApiPropertyOptional({ example: 2.3, minimum: 0 })
    pesoKg?: number;

    @ApiPropertyOptional({ example: 150, minimum: 0 })
    stockTotal?: number;
}

// ==========================================
// UPDATE STOCK
// ==========================================
export class UpdateStockDto {
    @ApiProperty({ example: 50, minimum: 0, description: 'Nueva cantidad de stock' })
    cantidad: number;
}

// ==========================================
// ADD STOCK
// ==========================================
export class AddStockDto {
    @ApiProperty({ example: 25, minimum: 1, description: 'Cantidad a agregar al stock' })
    cantidad: number;
}

// ==========================================
// RESERVE STOCK
// ==========================================
export class ReserveStockDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'ID del producto' })
    productoId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'ID del pedido' })
    pedidoId: string;

    @ApiProperty({ example: 5, minimum: 1, description: 'Cantidad a reservar' })
    cantidad: number;
}
