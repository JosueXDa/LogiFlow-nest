import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InventoryService } from './inventory.service';
import {
  CreateProductDto,
  UpdateProductDto,
  ReserveStockDto,
  UpdateStockDto,
} from './dto';
@Controller()
export class InventoryController {
  private readonly logger = new Logger(InventoryController.name);

  constructor(private readonly inventoryService: InventoryService) {}

  // CRUD de Productos
  @MessagePattern('create_product')
  async createProduct(@Payload() dto: CreateProductDto) {
    try {
      this.logger.log(`📥 Received create_product request`);
      this.logger.debug(`Product data: ${JSON.stringify(dto)}`);
      
      const result = await this.inventoryService.createProduct(dto);
      
      this.logger.log(`✅ Product created: ${result.nombre} (${result.id})`);
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to create product: ${error.message}`);
      this.logger.error(`Error details:`, error.stack);
      throw error;
    }
  }

  @MessagePattern('get_all_products')
  findAllProducts() {
    return this.inventoryService.findAllProducts();
  }

  @MessagePattern('get_product')
  findProductById(@Payload() id: string) {
    return this.inventoryService.findProductById(id);
  }

  @MessagePattern('get_product_by_sku')
  findProductBySku(@Payload() sku: string) {
    return this.inventoryService.findProductBySku(sku);
  }

  @MessagePattern('update_product')
  updateProduct(
    @Payload()
    payload: {
      id: string;
      dto: UpdateProductDto;
    },
  ) {
    return this.inventoryService.updateProduct(payload.id, payload.dto);
  }

  @MessagePattern('delete_product')
  deleteProduct(@Payload() id: string) {
    return this.inventoryService.deleteProduct(id);
  }

  // Gestión de Stock
  @MessagePattern('update_stock')
  updateStock(
    @Payload()
    payload: {
      id: string;
      dto: UpdateStockDto;
    },
  ) {
    return this.inventoryService.updateStock(payload.id, payload.dto);
  }

  @MessagePattern('add_stock')
  addStock(
    @Payload()
    payload: {
      id: string;
      cantidad: number;
    },
  ) {
    return this.inventoryService.addStock(payload.id, payload.cantidad);
  }

  @MessagePattern('check_stock')
  checkStock(@Payload() id: string) {
    return this.inventoryService.checkStock(id);
  }

  // Gestión de Reservas
  @MessagePattern('reserve_stock')
  reserveStock(@Payload() dto: ReserveStockDto) {
    return this.inventoryService.reserveStock(dto);
  }

  @MessagePattern('confirm_reserve')
  confirmReserve(@Payload() reservaId: string) {
    return this.inventoryService.confirmReserve(reservaId);
  }

  @MessagePattern('cancel_reserve')
  cancelReserve(@Payload() reservaId: string) {
    return this.inventoryService.cancelReserve(reservaId);
  }

  @MessagePattern('get_reserves_by_pedido')
  findReserveByPedidoId(@Payload() pedidoId: string) {
    return this.inventoryService.findReserveByPedidoId(pedidoId);
  }
}
