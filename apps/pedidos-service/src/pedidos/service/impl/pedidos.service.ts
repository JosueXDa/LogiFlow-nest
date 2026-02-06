import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { ItemPedido, Pedido, PedidoEstado, TipoVehiculo } from '../../entities';
import { CreatePedidoDto } from '../../dto/create-pedido.dto';
import { CancelPedidoDto } from '../../dto/cancel-pedido.dto';
import { UpdateEstadoDto } from '../../dto/update-estado.dto';
import {
  PEDIDOS_EVENT_CLIENT,
  INVENTORY_CLIENT,
  FLEET_CLIENT,
} from '../../pedidos.constants';
import { PedidosRepository } from '../../repository/pedidos.repository';
import { IPedidosService } from '../pedidos-service.interface';

@Injectable()
export class PedidosService implements IPedidosService {
  private readonly logger = new Logger(PedidosService.name);

  constructor(
    private readonly pedidosRepository: PedidosRepository,
    @Inject(PEDIDOS_EVENT_CLIENT)
    private readonly eventClient: ClientProxy,
    @Inject(INVENTORY_CLIENT)
    private readonly inventoryClient: ClientProxy,
    @Inject(FLEET_CLIENT)
    private readonly fleetClient: ClientProxy,
  ) { }

  async createPedido(dto: CreatePedidoDto): Promise<Pedido> {
    this.logger.log(
      `🆕 Iniciando creación de pedido para cliente: ${dto.clienteId}`,
    );
    this.logger.debug(`Items a procesar: ${dto.items.length}`);

    const productosInfo = await this.validarYObtenerProductos(dto.items);

    const pedido = this.pedidosRepository.createPedido({
      clienteId: dto.clienteId,
      estado: PedidoEstado.PENDIENTE,
      tipoVehiculo: dto.tipoVehiculo as TipoVehiculo,
      direccionOrigen: dto.origen,
      direccionDestino: dto.destino,
      items: dto.items.map((item, index) => {
        const productoInfo = productosInfo[index];
        return this.pedidosRepository.createItem({
          productoId: item.productoId,
          productoSku: productoInfo.sku,
          descripcion: item.descripcion || productoInfo.nombre,
          peso: item.peso || productoInfo.pesoKg,
          cantidad: item.cantidad,
          reservaId: null,
        });
      }),
    });

    const savedPedido = await this.pedidosRepository.savePedido(pedido);
    this.logger.log(`💾 Pedido guardado con ID: ${savedPedido.id}`);

    try {
      this.logger.log('🔒 Reservando stock para cada item...');
      const reservas = await this.reservarStockParaItems(savedPedido);

      for (let i = 0; i < savedPedido.items.length; i++) {
        savedPedido.items[i].reservaId = reservas[i].id;
      }
      await this.pedidosRepository.savePedido(savedPedido);

      this.logger.log(
        `✅ Pedido ${savedPedido.id} creado exitosamente con ${reservas.length} reservas`,
      );

      // Calcular peso total y distancia (valores temporales)
      const pesoTotal = savedPedido.items.reduce((sum, item) => sum + (item.peso * item.cantidad), 0);
      const distanciaKm = this.calcularDistancia(savedPedido.direccionOrigen, savedPedido.direccionDestino);

      // Mapear TipoVehiculo de Pedidos a Billing
      const tipoVehiculoMap = {
        'MOTO': 'MOTORIZADO',
        'LIVIANO': 'VEHICULO_LIVIANO',
        'CAMION': 'CAMION'
      };

      // Determinar tipoEntrega basado en distancia
      let tipoEntrega = 'URBANA';
      if (distanciaKm > 50) {
        tipoEntrega = 'INTERMUNICIPAL';
      }
      if (distanciaKm > 200) {
        tipoEntrega = 'NACIONAL';
      }

      // Emit evento a Billing Service para crear factura
      this.eventClient.emit('pedido.creado', {
        pedidoId: savedPedido.id,
        clienteId: savedPedido.clienteId,
        clienteNombre: 'Cliente Temporal', // TODO: Obtener de auth-service
        tipoEntrega,
        tipoVehiculo: tipoVehiculoMap[savedPedido.tipoVehiculo] || 'MOTORIZADO',
        distanciaKm,
        pesoKg: pesoTotal,
        esUrgente: false, // TODO: Agregar al DTO si es necesario
        timestamp: new Date().toISOString(),
        eventId: this.generarEventId(),
      });

      // Emit evento a Fleet Service para asignar repartidor
      this.fleetClient.emit('pedido.creado', {
        pedidoId: savedPedido.id,
        clienteId: savedPedido.clienteId,
        tipoEntrega,
        tipoVehiculo: tipoVehiculoMap[savedPedido.tipoVehiculo] || 'MOTORIZADO',
        pesoKg: pesoTotal,
        volumenM3: 0, // TODO: Calcular volumen si es necesario
        origenLat: savedPedido.direccionOrigen.lat,
        origenLng: savedPedido.direccionOrigen.lng,
        destinoLat: savedPedido.direccionDestino.lat,
        destinoLng: savedPedido.direccionDestino.lng,
        distanciaKm,
        esUrgente: false,
        timestamp: new Date().toISOString(),
        eventId: this.generarEventId(),
      });

      this.logger.log(`📤 Eventos pedido.creado emitidos a Billing y Fleet`);

      return savedPedido;
    } catch (error) {
      this.logger.error(
        `❌ Error al reservar stock para pedido ${savedPedido.id}:`,
        error.message,
      );
      this.logger.log('🔄 Iniciando compensación: Cancelando pedido...');

      await this.compensarPedidoFallido(savedPedido);

      throw new BadRequestException(
        `No se pudo crear el pedido: ${error.message}`,
      );
    }
  }

  private async validarYObtenerProductos(
    items: Array<{ productoId: string; cantidad: number }>,
  ): Promise<Array<{ sku: string; nombre: string; pesoKg: number }>> {
    const productosPromises = items.map(async (item) => {
      try {
        const producto = await firstValueFrom(
          this.inventoryClient.send('get_product', item.productoId),
        );
        this.logger.debug(
          `✅ Producto validado: ${producto.sku} - ${producto.nombre}`,
        );
        return producto;
      } catch (error) {
        this.logger.error(`❌ Producto no encontrado: ${item.productoId}`);
        throw new NotFoundException(
          `Producto ${item.productoId} no encontrado en inventario`,
        );
      }
    });

    return await Promise.all(productosPromises);
  }

  private async reservarStockParaItems(
    pedido: Pedido,
  ): Promise<Array<{ id: string }>> {
    const reservasPromises = pedido.items.map(async (item) => {
      this.logger.debug(`🔒 Reservando: ${item.cantidad}x ${item.productoSku}`);

      try {
        const reserva = await firstValueFrom(
          this.inventoryClient.send('reserve_stock', {
            productoId: item.productoId,
            pedidoId: pedido.id,
            cantidad: item.cantidad,
          }),
        );

        this.logger.debug(
          `✅ Reserva creada: ${reserva.id} para producto ${item.productoSku}`,
        );
        return reserva;
      } catch (error) {
        this.logger.error(
          `❌ Error al reservar ${item.productoSku}: ${error.message}`,
        );
        throw error;
      }
    });

    return await Promise.all(reservasPromises);
  }

  private async compensarPedidoFallido(pedido: Pedido): Promise<void> {
    try {
      pedido.estado = PedidoEstado.CANCELADO;
      await this.pedidosRepository.savePedido(pedido);

      this.inventoryClient.emit('pedido.cancelado', {
        pedidoId: pedido.id,
        razon: 'Error al reservar stock - Compensación automática',
        items: pedido.items
          .filter((item) => item.reservaId !== null)
          .map((item) => ({
            itemId: item.id,
            productoId: item.productoId,
            reservaId: item.reservaId,
          })),
        fecha: new Date(),
      });

      this.logger.log(`🔄 Compensación completada para pedido ${pedido.id}`);
    } catch (error) {
      this.logger.error(
        `❌ Error crítico en compensación del pedido ${pedido.id}:`,
        error.stack,
      );
    }
  }

  async findPedidoById(id: string): Promise<Pedido> {
    this.logger.debug(`🔍 Buscando pedido: ${id}`);

    const pedido = await this.pedidosRepository.findPedidoById(id);

    if (!pedido) {
      this.logger.warn(`⚠️  Pedido no encontrado: ${id}`);
      throw new NotFoundException('Pedido no encontrado');
    }

    return pedido;
  }

  async findAll(filters: { zonaId?: string; estado?: any }): Promise<Pedido[]> {
    this.logger.debug(
      `🔍 Buscando pedidos con filtros: ${JSON.stringify(filters)}`,
    );
    const pedidos = await this.pedidosRepository.findAll(filters);
    return pedidos;
  }

  async cancelPedido(id: string, dto: CancelPedidoDto): Promise<Pedido> {
    this.logger.log(`❌ Cancelando pedido: ${id}`);

    const pedido = await this.findPedidoById(id);

    if (
      [PedidoEstado.EN_RUTA, PedidoEstado.ENTREGADO].includes(pedido.estado)
    ) {
      throw new BadRequestException(
        'No se puede cancelar un pedido en ruta o entregado',
      );
    }

    pedido.estado = PedidoEstado.CANCELADO;
    const savedPedido = await this.pedidosRepository.savePedido(pedido);

    this.logger.log(
      `✅ Pedido ${id} marcado como cancelado, emitiendo evento...`,
    );

    this.inventoryClient.emit('pedido.cancelado', {
      pedidoId: savedPedido.id,
      razon: dto?.razon || 'Cancelacion sin razon especificada',
      items: savedPedido.items
        .filter((item) => item.reservaId !== null)
        .map((item) => ({
          itemId: item.id,
          productoId: item.productoId,
          reservaId: item.reservaId,
        })),
      fecha: new Date(),
    });

    return savedPedido;
  }

  async updateEstado(id: string, dto: UpdateEstadoDto): Promise<Pedido> {
    this.logger.log(
      `🔄 Actualizando estado de pedido ${id} a: ${dto.nuevoEstado}`,
    );

    const pedido = await this.findPedidoById(id);

    if (pedido.estado === PedidoEstado.CANCELADO) {
      throw new BadRequestException(
        'No se puede modificar un pedido cancelado',
      );
    }

    pedido.estado = dto.nuevoEstado;
    pedido.evidenciaEntrega = dto.evidenciaEntrega ?? pedido.evidenciaEntrega;

    const savedPedido = await this.pedidosRepository.savePedido(pedido);

    this.eventClient.emit('pedido.estado.actualizado', {
      id: savedPedido.id,
      nuevoEstado: savedPedido.estado,
      clienteId: savedPedido.clienteId,
    });

    if (savedPedido.estado === PedidoEstado.ENTREGADO) {
      this.logger.log(
        `📦 Pedido ${id} marcado como ENTREGADO, confirmando reservas...`,
      );

      this.inventoryClient.emit('pedido.entregado', {
        pedidoId: savedPedido.id,
        items: savedPedido.items
          .filter((item) => item.reservaId !== null)
          .map((item) => ({
            itemId: item.id,
            productoId: item.productoId,
            reservaId: item.reservaId,
          })),
        fecha: new Date(),
      });
    }

    this.logger.log(
      `✅ Estado de pedido ${id} actualizado a: ${dto.nuevoEstado}`,
    );

    return savedPedido;
  }

  async handleConductorAsignado(payload: {
    pedidoId: string;
    conductorId: string;
  }): Promise<void> {
    const pedido = await this.findPedidoById(payload.pedidoId);

    if (pedido.estado !== PedidoEstado.PENDIENTE) {
      return;
    }

    pedido.repartidorId = payload.conductorId;
    pedido.estado = PedidoEstado.ASIGNADO;
    await this.pedidosRepository.savePedido(pedido);
  }

  async handleAsignacionFallida(payload: {
    pedidoId: string;
    razon: string;
  }): Promise<void> {
    const pedido = await this.findPedidoById(payload.pedidoId);

    if (pedido.estado !== PedidoEstado.PENDIENTE) {
      return;
    }

    pedido.estado = PedidoEstado.CANCELADO;
    await this.pedidosRepository.savePedido(pedido);

    this.inventoryClient.emit('pedido.cancelado', {
      pedidoId: pedido.id,
      razon: payload.razon,
    });
  }
  async handleEntregaCompletada(payload: { pedidoId: string; fecha: Date }): Promise<void> {
    const pedido = await this.findPedidoById(payload.pedidoId);

    if (pedido.estado === PedidoEstado.ENTREGADO) {
      return;
    }

    pedido.estado = PedidoEstado.ENTREGADO;
    pedido.evidenciaEntrega = 'Entrega confirmada automÃ¡ticamente por FleetService'; // Opcional
    const savedPedido = await this.pedidosRepository.savePedido(pedido);

    this.logger.log(`📦 Pedido ${savedPedido.id} marcado como ENTREGADO via evento fleet`);

    // Emitir eventos colaterales
    this.inventoryClient.emit('pedido.entregado', {
      pedidoId: savedPedido.id,
      items: savedPedido.items
        .filter((item) => item.reservaId !== null)
        .map((item) => ({
          itemId: item.id,
          productoId: item.productoId,
          reservaId: item.reservaId,
        })),
      fecha: new Date(),
    });

    this.eventClient.emit('pedido.estado.actualizado', {
      id: savedPedido.id,
      nuevoEstado: savedPedido.estado,
      clienteId: savedPedido.clienteId,
    });
  }

  async confirmPedido(id: string): Promise<Pedido> {
    const pedido = await this.findPedidoById(id);

    if (pedido.estado !== PedidoEstado.PENDIENTE && pedido.estado !== PedidoEstado.ASIGNADO) {
      throw new BadRequestException('Solo se pueden confirmar pedidos en estado PENDIENTE o ASIGNADO');
    }

    // Actualizar estado a CONFIRMADO
    pedido.estado = PedidoEstado.CONFIRMADO;
    await this.pedidosRepository.savePedido(pedido);
    this.logger.log(`✅ Pedido ${id} actualizado a estado CONFIRMADO`);

    // Emitir evento para facturación
    const eventPayload = {
      pedidoId: pedido.id,
      timestamp: new Date().toISOString(),
      eventId: crypto.randomUUID(),
      clienteId: pedido.clienteId,
      total: 100 // Mock total, el real vendrá del evento factura.emitida
    };

    this.logger.debug(`📤 Emitiendo evento 'pedido.confirmado' con payload: ${JSON.stringify(eventPayload)}`);
    
    try {
      this.eventClient.emit('pedido.confirmado', eventPayload);
      this.logger.log(`✅ Evento pedido.confirmado emitido para pedido ${id}`);
    } catch (error) {
      this.logger.error(`❌ Error emitiendo evento: ${error.message}`, error.stack);
    }

    return pedido;
  }

  /**
   * Actualiza el precioTotal del pedido (llamado desde evento factura.emitida)
   */
  async updatePrecioTotal(pedidoId: string, precioTotal: number): Promise<void> {
    this.logger.debug(`💰 Actualizando precioTotal para pedido ${pedidoId}: ${precioTotal}`);
    
    const pedido = await this.findPedidoById(pedidoId);
    pedido.precioTotal = precioTotal;
    await this.pedidosRepository.savePedido(pedido);
    
    this.logger.log(`✅ Precio total actualizado: ${precioTotal}`);
  }

  /**
   * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
   */
  private calcularDistancia(
    origen: { lat: number; lng: number },
    destino: { lat: number; lng: number }
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(destino.lat - origen.lat);
    const dLng = this.deg2rad(destino.lng - origen.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(origen.lat)) * Math.cos(this.deg2rad(destino.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    
    return Math.round(distance * 100) / 100; // Redondear a 2 decimales
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private generarEventId(): string {
    return crypto.randomUUID();
  }
}
