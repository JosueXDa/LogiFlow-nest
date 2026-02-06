import {
  Body,
  Controller,
  Get,
  Inject,
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

@Controller('pedidos')
export class PedidosController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.PEDIDOS_SERVICE)
    private pedidosServiceClient: ClientProxy,
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('CLIENTE', 'REPARTIDOR', 'SUPERVISOR', 'GERENTE', 'ADMIN')
  async createPedido(@Body() createPedidoDto: any) {
    return firstValueFrom(
      this.pedidosServiceClient.send('create_pedido', createPedidoDto),
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('CLIENTE', 'REPARTIDOR', 'SUPERVISOR', 'GERENTE')
  async getPedido(@Param('id') id: string) {
    return firstValueFrom(this.pedidosServiceClient.send('get_pedido', id));
  }

  @Patch(':id/cancelar')
  @UseGuards(AuthGuard)
  @Roles('CLIENTE', 'GERENTE', 'ADMIN')
  async cancelarPedido(
    @Param('id') id: string,
    @Body() cancelPedidoDto: any,
  ): Promise<unknown> {
    return firstValueFrom(
      this.pedidosServiceClient.send('cancel_pedido', {
        id,
        dto: cancelPedidoDto as Record<string, unknown>,
      }),
    );
  }

  @Patch(':id/estado')
  @UseGuards(AuthGuard)
  @Roles('REPARTIDOR')
  async actualizarEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: any,
  ) {
    return firstValueFrom(
      this.pedidosServiceClient.send('update_estado_pedido', {
        id,
        dto: updateEstadoDto,
      }),
    );
  }

  @Post(':id/confirmar')
  @UseGuards(AuthGuard)
  @Roles('REPARTIDOR')
  async confirmarPedido(@Param('id') id: string) {
    return firstValueFrom(
      this.pedidosServiceClient.send('confirm_pedido', id),
    );
  }
}
