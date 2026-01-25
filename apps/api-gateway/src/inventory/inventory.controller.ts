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
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.INVENTORY_SERVICE)
    private inventoryServiceClient: ClientProxy,
  ) {}

  // CRUD de Productos
  @Post('products')
  @UseGuards(AuthGuard)
  async createProduct(@Body() createProductDto: any) {
    return firstValueFrom(
      this.inventoryServiceClient.send('create_product', createProductDto),
    );
  }

  @Get('products')
  @UseGuards(AuthGuard)
  async getAllProducts() {
    return firstValueFrom(
      this.inventoryServiceClient.send('get_all_products', {}),
    );
  }

  @Get('products/:id')
  @UseGuards(AuthGuard)
  async getProduct(@Param('id') id: string) {
    return firstValueFrom(this.inventoryServiceClient.send('get_product', id));
  }

  @Get('products/sku/:sku')
  @UseGuards(AuthGuard)
  async getProductBySku(@Param('sku') sku: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('get_product_by_sku', sku),
    );
  }

  @Patch('products/:id')
  @UseGuards(AuthGuard)
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: any) {
    return firstValueFrom(
      this.inventoryServiceClient.send('update_product', {
        id,
        dto: updateProductDto,
      }),
    );
  }

  @Delete('products/:id')
  @UseGuards(AuthGuard)
  async deleteProduct(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('delete_product', id),
    );
  }

  // Gestión de Stock
  @Patch('products/:id/stock')
  @UseGuards(AuthGuard)
  async updateStock(@Param('id') id: string, @Body() updateStockDto: any) {
    return firstValueFrom(
      this.inventoryServiceClient.send('update_stock', {
        id,
        dto: updateStockDto,
      }),
    );
  }

  @Post('products/:id/stock/add')
  @UseGuards(AuthGuard)
  async addStock(@Param('id') id: string, @Body() body: { cantidad: number }) {
    return firstValueFrom(
      this.inventoryServiceClient.send('add_stock', {
        id,
        cantidad: body.cantidad,
      }),
    );
  }

  @Get('products/:id/stock')
  @UseGuards(AuthGuard)
  async checkStock(@Param('id') id: string) {
    return firstValueFrom(this.inventoryServiceClient.send('check_stock', id));
  }

  // Gestión de Reservas
  @Post('reserves')
  @UseGuards(AuthGuard)
  async reserveStock(@Body() reserveStockDto: any) {
    return firstValueFrom(
      this.inventoryServiceClient.send('reserve_stock', reserveStockDto),
    );
  }

  @Patch('reserves/:id/confirm')
  @UseGuards(AuthGuard)
  async confirmReserve(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('confirm_reserve', id),
    );
  }

  @Patch('reserves/:id/cancel')
  @UseGuards(AuthGuard)
  async cancelReserve(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('cancel_reserve', id),
    );
  }

  @Get('reserves/pedido/:pedidoId')
  @UseGuards(AuthGuard)
  async getReservesByPedido(@Param('pedidoId') pedidoId: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('get_reserves_by_pedido', pedidoId),
    );
  }
}
