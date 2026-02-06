import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { firstValueFrom } from 'rxjs';
import {
  CreateProductDto,
  UpdateProductDto,
  UpdateStockDto,
  AddStockDto,
  ReserveStockDto,
} from '../swagger/dto/inventory.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.INVENTORY_SERVICE)
    private inventoryServiceClient: ClientProxy,
  ) { }

  // CRUD de Productos
  @Post('products')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Crear producto', description: 'Crea un nuevo producto en el inventario' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return firstValueFrom(
      this.inventoryServiceClient.send('create_product', createProductDto),
    );
  }

  @Get('products')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Listar productos', description: 'Obtiene todos los productos del inventario' })
  @ApiResponse({ status: 200, description: 'Lista de productos' })
  async getAllProducts() {
    return firstValueFrom(
      this.inventoryServiceClient.send('get_all_products', {}),
    );
  }

  @Get('products/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiParam({ name: 'id', description: 'ID del producto (UUID)' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getProduct(@Param('id') id: string) {
    return firstValueFrom(this.inventoryServiceClient.send('get_product', id));
  }

  @Get('products/sku/:sku')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Buscar producto por SKU' })
  @ApiParam({ name: 'sku', description: 'Código SKU del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  async getProductBySku(@Param('sku') sku: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('get_product_by_sku', sku),
    );
  }

  @Patch('products/:id')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar producto' })
  @ApiParam({ name: 'id', description: 'ID del producto (UUID)' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 200, description: 'Producto actualizado' })
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return firstValueFrom(
      this.inventoryServiceClient.send('update_product', {
        id,
        dto: updateProductDto,
      }),
    );
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiParam({ name: 'id', description: 'ID del producto (UUID)' })
  @ApiResponse({ status: 200, description: 'Producto eliminado' })
  async deleteProduct(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('delete_product', id),
    );
  }

  // Gestión de Stock
  @Patch('products/:id/stock')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar stock', description: 'Establece la cantidad de stock para un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto (UUID)' })
  @ApiBody({ type: UpdateStockDto })
  @ApiResponse({ status: 200, description: 'Stock actualizado' })
  async updateStock(@Param('id') id: string, @Body() updateStockDto: UpdateStockDto) {
    return firstValueFrom(
      this.inventoryServiceClient.send('update_stock', {
        id,
        dto: updateStockDto,
      }),
    );
  }

  @Post('products/:id/stock/add')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Agregar stock', description: 'Incrementa el stock de un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto (UUID)' })
  @ApiBody({ type: AddStockDto })
  @ApiResponse({ status: 200, description: 'Stock agregado' })
  async addStock(@Param('id') id: string, @Body() body: AddStockDto) {
    return firstValueFrom(
      this.inventoryServiceClient.send('add_stock', {
        id,
        cantidad: body.cantidad,
      }),
    );
  }

  @Get('products/:id/stock')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Consultar stock', description: 'Obtiene la información de stock de un producto' })
  @ApiParam({ name: 'id', description: 'ID del producto (UUID)' })
  @ApiResponse({ status: 200, description: 'Información de stock' })
  async checkStock(@Param('id') id: string) {
    return firstValueFrom(this.inventoryServiceClient.send('check_stock', id));
  }

  // Gestión de Reservas
  @Post('reserves')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'SISTEMA')
  @ApiOperation({ summary: 'Reservar stock', description: 'Crea una reserva de stock para un pedido' })
  @ApiBody({ type: ReserveStockDto })
  @ApiResponse({ status: 201, description: 'Reserva creada' })
  async reserveStock(@Body() reserveStockDto: ReserveStockDto) {
    return firstValueFrom(
      this.inventoryServiceClient.send('reserve_stock', reserveStockDto),
    );
  }

  @Patch('reserves/:id/confirm')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'SISTEMA')
  @ApiOperation({ summary: 'Confirmar reserva', description: 'Confirma una reserva de stock (descuenta del inventario)' })
  @ApiParam({ name: 'id', description: 'ID de la reserva (UUID)' })
  @ApiResponse({ status: 200, description: 'Reserva confirmada' })
  async confirmReserve(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('confirm_reserve', id),
    );
  }

  @Patch('reserves/:id/cancel')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'SISTEMA')
  @ApiOperation({ summary: 'Cancelar reserva', description: 'Cancela una reserva y libera el stock' })
  @ApiParam({ name: 'id', description: 'ID de la reserva (UUID)' })
  @ApiResponse({ status: 200, description: 'Reserva cancelada' })
  async cancelReserve(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('cancel_reserve', id),
    );
  }

  @Get('reserves/pedido/:pedidoId')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'SISTEMA')
  @ApiOperation({ summary: 'Obtener reservas por pedido', description: 'Lista las reservas asociadas a un pedido' })
  @ApiParam({ name: 'pedidoId', description: 'ID del pedido (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de reservas' })
  async getReservesByPedido(@Param('pedidoId') pedidoId: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('get_reserves_by_pedido', pedidoId),
    );
  }
}
