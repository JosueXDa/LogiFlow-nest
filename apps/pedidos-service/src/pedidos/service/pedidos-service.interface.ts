import { CancelPedidoDto } from '../dto/cancel-pedido.dto';
import { CreatePedidoDto } from '../dto/create-pedido.dto';
import { UpdateEstadoDto } from '../dto/update-estado.dto';
import { Pedido } from '../entities';

export const PEDIDOS_SERVICE = Symbol('PEDIDOS_SERVICE');

export interface IPedidosService {
  createPedido(dto: CreatePedidoDto): Promise<Pedido>;
  findPedidoById(id: string): Promise<Pedido>;
  cancelPedido(id: string, dto: CancelPedidoDto): Promise<Pedido>;
  updateEstado(id: string, dto: UpdateEstadoDto): Promise<Pedido>;
  handleConductorAsignado(payload: {
    pedidoId: string;
    conductorId: string;
  }): Promise<void>;
  handleAsignacionFallida(payload: {
    pedidoId: string;
    razon: string;
  }): Promise<void>;
}
