import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Producto, ReservaStock, EstadoReserva } from './entities';
import {
  CreateProductDto,
  UpdateProductDto,
  ReserveStockDto,
  UpdateStockDto,
} from './dto';
import { INVENTORY_EVENT_CLIENT } from './inventory.constants';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Producto)
    private readonly productoRepository: Repository<Producto>,
    @InjectRepository(ReservaStock)
    private readonly reservaRepository: Repository<ReservaStock>,
    @Inject(INVENTORY_EVENT_CLIENT)
    private readonly eventClient: ClientProxy,
  ) {}

  // CRUD de Productos
  async createProduct(dto: CreateProductDto): Promise<Producto> {
    // Verificar que el SKU sea único
    const existingSku = await this.productoRepository.findOne({
      where: { sku: dto.sku },
    });

    if (existingSku) {
      throw new BadRequestException('El SKU ya existe');
    }

    const producto = this.productoRepository.create(dto);
    return await this.productoRepository.save(producto);
  }

  async findAllProducts(): Promise<Producto[]> {
    return await this.productoRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findProductById(id: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { id },
      relations: ['reservas'],
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async findProductBySku(sku: string): Promise<Producto> {
    const producto = await this.productoRepository.findOne({
      where: { sku },
      relations: ['reservas'],
    });

    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    return producto;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Producto> {
    const producto = await this.findProductById(id);

    Object.assign(producto, dto);

    return await this.productoRepository.save(producto);
  }

  async deleteProduct(id: string): Promise<void> {
    const producto = await this.findProductById(id);

    // Verificar que no tenga reservas activas
    const reservasActivas = await this.reservaRepository.count({
      where: {
        producto: { id },
        estado: EstadoReserva.PENDIENTE,
      },
    });

    if (reservasActivas > 0) {
      throw new BadRequestException(
        'No se puede eliminar un producto con reservas activas',
      );
    }

    await this.productoRepository.remove(producto);
  }

  // Gestión de Stock
  async updateStock(id: string, dto: UpdateStockDto): Promise<Producto> {
    const producto = await this.findProductById(id);

    if (dto.cantidad < producto.stockReservado) {
      throw new BadRequestException(
        'El stock total no puede ser menor al stock reservado',
      );
    }

    producto.stockTotal = dto.cantidad;

    return await this.productoRepository.save(producto);
  }

  async addStock(id: string, cantidad: number): Promise<Producto> {
    const producto = await this.findProductById(id);

    producto.stockTotal += cantidad;

    return await this.productoRepository.save(producto);
  }

  async checkStock(id: string): Promise<{
    stockTotal: number;
    stockReservado: number;
    stockDisponible: number;
  }> {
    const producto = await this.findProductById(id);

    return {
      stockTotal: producto.stockTotal,
      stockReservado: producto.stockReservado,
      stockDisponible: producto.stockDisponible,
    };
  }

  // Gestión de Reservas (Para Saga Pattern)
  async reserveStock(dto: ReserveStockDto): Promise<ReservaStock> {
    this.logger.log(
      `🔒 Intentando reservar stock - Producto: ${dto.productoId}, Cantidad: ${dto.cantidad}`,
    );

    const producto = await this.findProductById(dto.productoId);

    this.logger.debug(
      `📦 Stock disponible: ${producto.stockDisponible} (Total: ${producto.stockTotal}, Reservado: ${producto.stockReservado})`,
    );

    // Verificar stock disponible
    if (producto.stockDisponible < dto.cantidad) {
      this.logger.warn(
        `⚠️  Stock insuficiente - Producto: ${producto.sku}, Disponible: ${producto.stockDisponible}, Solicitado: ${dto.cantidad}`,
      );

      // Emitir evento de stock insuficiente
      this.eventClient.emit('stock.insuficiente', {
        pedidoId: dto.pedidoId,
        productoId: dto.productoId,
        productoSku: producto.sku,
        stockDisponible: producto.stockDisponible,
        cantidadSolicitada: dto.cantidad,
        fecha: new Date(),
      });

      throw new BadRequestException('Stock insuficiente');
    }

    // Usar transacción para garantizar atomicidad
    return await this.reservaRepository.manager.transaction(
      async (transactionalEntityManager) => {
        // 1. Incrementar stock reservado primero
        producto.stockReservado += dto.cantidad;
        await transactionalEntityManager.save(Producto, producto);

        // 2. Crear reserva después (productoId se obtiene automáticamente de la relación)
        const reserva = this.reservaRepository.create({
          pedidoId: dto.pedidoId,
          producto,
          cantidad: dto.cantidad,
          estado: EstadoReserva.PENDIENTE,
          expiraEn: new Date(Date.now() + 30 * 60 * 1000), // 30 minutos
        });

        const savedReserva = await transactionalEntityManager.save(
          ReservaStock,
          reserva,
        );

        this.logger.log(
          `✅ Stock reservado - Reserva ID: ${savedReserva.id}, Producto: ${producto.sku}`,
        );

        // 3. Emitir evento de stock reservado exitosamente (fuera de la transacción, se ejecutará aunque falle)
        this.eventClient.emit('stock.reservado', {
          reservaId: savedReserva.id,
          pedidoId: dto.pedidoId,
          productoId: dto.productoId,
          productoSku: producto.sku,
          cantidad: dto.cantidad,
          stockDisponible: producto.stockDisponible - dto.cantidad,
          fecha: new Date(),
        });

        return savedReserva;
      },
    );
  }

  async confirmReserve(reservaId: string): Promise<ReservaStock> {
    this.logger.log(`✅ Confirmando reserva: ${reservaId}`);

    const reserva = await this.reservaRepository.findOne({
      where: { id: reservaId },
      relations: ['producto'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.estado !== EstadoReserva.PENDIENTE) {
      this.logger.warn(
        `⚠️  Reserva ${reservaId} no se puede confirmar (Estado: ${reserva.estado})`,
      );
      throw new BadRequestException('La reserva ya fue procesada');
    }

    // Confirmar reserva y descontar stock
    reserva.estado = EstadoReserva.CONFIRMADA;
    await this.reservaRepository.save(reserva);

    const producto = reserva.producto;
    producto.stockTotal -= reserva.cantidad;
    producto.stockReservado -= reserva.cantidad;
    await this.productoRepository.save(producto);

    this.logger.log(
      `✅ Reserva confirmada - Stock descontado: ${reserva.cantidad} unidades de ${producto.sku}`,
    );

    // Emitir evento de reserva confirmada
    this.eventClient.emit('reserva.confirmada', {
      pedidoId: reserva.pedidoId,
      productoId: reserva.productoId, // Usar el campo directo en lugar de la relación
      cantidad: reserva.cantidad,
      fecha: new Date(),
    });

    return reserva;
  }

  async cancelReserve(reservaId: string): Promise<ReservaStock> {
    this.logger.log(`❌ Cancelando reserva: ${reservaId}`);

    const reserva = await this.reservaRepository.findOne({
      where: { id: reservaId },
      relations: ['producto'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada');
    }

    if (reserva.estado !== EstadoReserva.PENDIENTE) {
      this.logger.warn(
        `⚠️  Reserva ${reservaId} no se puede cancelar (Estado: ${reserva.estado})`,
      );
      throw new BadRequestException('La reserva ya fue procesada');
    }

    // Cancelar reserva y liberar stock
    reserva.estado = EstadoReserva.CANCELADA;
    await this.reservaRepository.save(reserva);

    const producto = reserva.producto;
    producto.stockReservado -= reserva.cantidad;
    await this.productoRepository.save(producto);

    this.logger.log(
      `✅ Reserva cancelada - Stock liberado: ${reserva.cantidad} unidades de ${producto.sku}`,
    );

    // Emitir evento de stock liberado
    this.eventClient.emit('stock.liberado', {
      pedidoId: reserva.pedidoId,
      productoId: reserva.productoId, // Usar el campo directo en lugar de la relación
      cantidad: reserva.cantidad,
      fecha: new Date(),
    });

    return reserva;
  }

  async findReserveByPedidoId(pedidoId: string): Promise<ReservaStock[]> {
    return await this.reservaRepository.find({
      where: { pedidoId },
      relations: ['producto'],
    });
  }
}
