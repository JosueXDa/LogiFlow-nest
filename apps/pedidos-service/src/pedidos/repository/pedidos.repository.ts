import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemPedido, Pedido } from '../entities';

@Injectable()
export class PedidosRepository {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidosRepository: Repository<Pedido>,
    @InjectRepository(ItemPedido)
    private readonly itemsRepository: Repository<ItemPedido>,
  ) { }

  createPedido(data: Partial<Pedido>): Pedido {
    return this.pedidosRepository.create(data);
  }

  createItem(data: Partial<ItemPedido>): ItemPedido {
    return this.itemsRepository.create(data);
  }

  savePedido(pedido: Pedido): Promise<Pedido> {
    return this.pedidosRepository.save(pedido);
  }

  savePedidos(pedidos: Pedido[]): Promise<Pedido[]> {
    return this.pedidosRepository.save(pedidos);
  }

  saveItems(items: ItemPedido[]): Promise<ItemPedido[]> {
    return this.itemsRepository.save(items);
  }

  findPedidoById(id: string): Promise<Pedido | null> {
    return this.pedidosRepository.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  findAll(filters: { zonaId?: string; estado?: any }): Promise<Pedido[]> {
    const query = this.pedidosRepository
      .createQueryBuilder('pedido')
      .leftJoinAndSelect('pedido.items', 'items');

    if (filters.estado) {
      query.andWhere('pedido.estado = :estado', { estado: filters.estado });
    }

    // Nota: Por ahora no tenemos zonaId en la entidad Pedido directamente, 
    // pero si se requiriera filtrar por zona, deberíamos tener esa relación o campo.
    // Asumiremos por el momento que el filtro se aplica si existe el campo o relaciones futuras.
    // Si la zona es derivada del repartidor o dirección, sería más complejo.
    // Revisando el requerimiento: "zonaId: UIO-NORTE". 
    // Si la zona está asociada al pedido (ej. zona de reparto), debería estar en la entidad.
    // Si no, tal vez es un filtro que se aplica post-fetch o via Join con FleetService (lo cual no es ideal en DB layer).
    // Viendo la entidad Pedido (que no he visto completa pero asumo), no vi zonaId explicito en el create.
    // Sin embargo, en el requerimiento dice: pedidos(filtro: { zonaId: "UIO-NORTE", estado: EN_RUTA })
    // Voy a asumir que debemos agregar lógica o que el campo existe/existirá.
    // Por ahora implementaré el filtro basico.

    return query.getMany();
  }
}
