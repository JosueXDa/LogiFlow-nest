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
  ) {}

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
}
