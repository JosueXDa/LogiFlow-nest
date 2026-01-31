import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { CancelPedidoDto } from './dto/cancel-pedido.dto';
import { UpdateEstadoDto } from './dto/update-estado.dto';
import { PEDIDOS_SERVICE } from './service/pedidos-service.interface';
import type { IPedidosService } from './service/pedidos-service.interface';

@Controller()
export class PedidosController {
  constructor(
    @Inject(PEDIDOS_SERVICE)
    private readonly pedidosService: IPedidosService,
  ) { }

  @MessagePattern('create_pedido')
  create(@Payload() dto: CreatePedidoDto) {
    return this.pedidosService.createPedido(dto);
  }

  @MessagePattern('get_pedido')
  findOne(@Payload() id: string) {
    return this.pedidosService.findPedidoById(id);
  }

  @MessagePattern('cancel_pedido')
  cancelar(
    @Payload()
    payload: {
      id: string;
      dto: CancelPedidoDto;
    },
  ) {
    return this.pedidosService.cancelPedido(payload.id, payload.dto);
  }

  @MessagePattern('update_estado_pedido')
  actualizarEstado(
    @Payload()
    payload: {
      id: string;
      dto: UpdateEstadoDto;
    },
  ) {
    return this.pedidosService.updateEstado(payload.id, payload.dto);
  }

  @MessagePattern('confirm_pedido')
  async confirmar(@Payload() id: string) {
    return this.pedidosService.confirmPedido(id);
  }
}
