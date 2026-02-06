import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('inventory')
export class InventoryController implements OnModuleInit {
  private readonly logger = new Logger(InventoryController.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.INVENTORY_SERVICE)
    private inventoryServiceClient: ClientProxy,
  ) { }

  async onModuleInit() {
    try {
      await this.inventoryServiceClient.connect();
      this.logger.log('✅ Connected to Inventory Service');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Inventory Service', error);
    }
  }

  // CRUD de Productos
  @Post('products')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  async createProduct(@Body() createProductDto: any) {
    try {
      this.logger.log('📝 Creating product...');
      this.logger.debug(`Product data: ${JSON.stringify(createProductDto)}`);
      
      const result = await firstValueFrom(
        this.inventoryServiceClient.send('create_product', createProductDto),
      );
      
      this.logger.log(`✅ Product created: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error('❌ Failed to create product', error);
      throw error;
    }
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
  @Roles('GERENTE', 'ADMIN')
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
  @Roles('GERENTE', 'ADMIN')
  async deleteProduct(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('delete_product', id),
    );
  }

  // Gestión de Stock
  @Patch('products/:id/stock')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
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
  @Roles('GERENTE', 'ADMIN')
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
  @Roles('ADMIN', 'SISTEMA')
  async reserveStock(@Body() reserveStockDto: any) {
    return firstValueFrom(
      this.inventoryServiceClient.send('reserve_stock', reserveStockDto),
    );
  }

  @Patch('reserves/:id/confirm')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'SISTEMA')
  async confirmReserve(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('confirm_reserve', id),
    );
  }

  @Patch('reserves/:id/cancel')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'SISTEMA')
  async cancelReserve(@Param('id') id: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('cancel_reserve', id),
    );
  }

  @Get('reserves/pedido/:pedidoId')
  @UseGuards(AuthGuard)
  @Roles('ADMIN', 'SISTEMA')
  async getReservesByPedido(@Param('pedidoId') pedidoId: string) {
    return firstValueFrom(
      this.inventoryServiceClient.send('get_reserves_by_pedido', pedidoId),
    );
  }
}
