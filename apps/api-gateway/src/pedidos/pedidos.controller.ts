import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { firstValueFrom } from 'rxjs';
import { CreatePedidoDto, CancelPedidoDto, UpdateEstadoDto } from '../swagger/dto/pedidos.dto';

@ApiTags('Pedidos')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('pedidos')
export class PedidosController implements OnModuleInit {
  private readonly logger = new Logger(PedidosController.name);

  constructor(
    @Inject(MICROSERVICES_CLIENTS.PEDIDOS_SERVICE)
    private pedidosServiceClient: ClientProxy,
  ) { }

  async onModuleInit() {
    try {
      await this.pedidosServiceClient.connect();
      this.logger.log('✅ Connected to Pedidos Service');
    } catch (error) {
      this.logger.error('❌ Failed to connect to Pedidos Service:', error.message);
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('CLIENTE', 'REPARTIDOR', 'SUPERVISOR', 'GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Crear pedido', description: 'Crea un nuevo pedido con origen, destino e items' })
  @ApiBody({ type: CreatePedidoDto })
  @ApiResponse({ status: 201, description: 'Pedido creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  async createPedido(@Body() createPedidoDto: CreatePedidoDto) {
    this.logger.log('📝 Creating pedido...');
    this.logger.debug('DTO:', JSON.stringify(createPedidoDto));
    
    try {
      const result = await firstValueFrom(
        this.pedidosServiceClient.send('create_pedido', createPedidoDto),
      );
      this.logger.log('✅ Pedido created successfully');
      return result;
    } catch (error) {
      this.logger.error('❌ Error creating pedido:', error.message);
      throw error;
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('CLIENTE', 'REPARTIDOR', 'SUPERVISOR', 'GERENTE')
  @ApiOperation({ summary: 'Obtener pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID del pedido (UUID)' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  async getPedido(@Param('id') id: string) {
    return firstValueFrom(this.pedidosServiceClient.send('get_pedido', id));
  }

  @Patch(':id/cancelar')
  @UseGuards(AuthGuard)
  @Roles('CLIENTE', 'GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Cancelar pedido', description: 'Cancela un pedido especificando la razón' })
  @ApiParam({ name: 'id', description: 'ID del pedido (UUID)' })
  @ApiBody({ type: CancelPedidoDto })
  @ApiResponse({ status: 200, description: 'Pedido cancelado exitosamente' })
  async cancelarPedido(
    @Param('id') id: string,
    @Body() cancelPedidoDto: CancelPedidoDto,
  ): Promise<unknown> {
    return firstValueFrom(
      this.pedidosServiceClient.send('cancel_pedido', {
        id,
        dto: cancelPedidoDto,
      }),
    );
  }

  @Patch(':id/estado')
  @UseGuards(AuthGuard)
  @Roles('REPARTIDOR')
  @ApiOperation({ summary: 'Actualizar estado', description: 'Actualiza el estado del pedido (EN_RUTA o ENTREGADO)' })
  @ApiParam({ name: 'id', description: 'ID del pedido (UUID)' })
  @ApiBody({ type: UpdateEstadoDto })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async actualizarEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoDto,
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
  @ApiOperation({ summary: 'Confirmar pedido', description: 'Confirma la recepción del pedido por el repartidor' })
  @ApiParam({ name: 'id', description: 'ID del pedido (UUID)' })
  @ApiResponse({ status: 200, description: 'Pedido confirmado' })
  async confirmarPedido(@Param('id') id: string) {
    return firstValueFrom(
      this.pedidosServiceClient.send('confirm_pedido', id),
    );
  }
}
