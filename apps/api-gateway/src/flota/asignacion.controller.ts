import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import {
  AsignarRepartidorDto,
  FinalizarAsignacionDto,
} from '../swagger/dto/fleet.dto';

@ApiTags('Fleet-Asignaciones')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('flota/asignaciones')
export class AsignacionController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Asignar pedido a repartidor', description: 'Asigna automáticamente un pedido al repartidor más adecuado' })
  @ApiBody({ type: AsignarRepartidorDto })
  @ApiResponse({ status: 201, description: 'Asignación creada exitosamente' })
  async asignar(@Body() asignarRepartidorDto: AsignarRepartidorDto) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.asignacion.asignar' },
        asignarRepartidorDto,
      ),
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('SUPERVISOR', 'GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Listar asignaciones', description: 'Obtiene lista paginada de asignaciones con filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'pedidoId', required: false, description: 'Filtrar por pedido (UUID)' })
  @ApiQuery({ name: 'repartidorId', required: false, description: 'Filtrar por repartidor (UUID)' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('pedidoId') pedidoId?: string,
    @Query('repartidorId') repartidorId?: string,
    @Query('estado') estado?: string,
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.asignacion.findAll' },
        {
          filters: { pedidoId, repartidorId, estado },
          page,
          limit,
        },
      ),
    );
  }

  @Post(':id/iniciar')
  @UseGuards(AuthGuard)
  @Roles('REPARTIDOR')
  @ApiOperation({ summary: 'Iniciar asignación', description: 'El repartidor inicia la entrega asignada' })
  @ApiParam({ name: 'id', description: 'ID de la asignación (UUID)' })
  @ApiResponse({ status: 200, description: 'Asignación iniciada' })
  async iniciar(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.asignacion.iniciar' }, { id }),
    );
  }

  @Post('finalizar')
  @UseGuards(AuthGuard)
  @Roles('REPARTIDOR')
  @ApiOperation({ summary: 'Finalizar asignación', description: 'El repartidor finaliza la entrega' })
  @ApiBody({ type: FinalizarAsignacionDto })
  @ApiResponse({ status: 200, description: 'Asignación finalizada' })
  async finalizar(@Body() finalizarAsignacionDto: FinalizarAsignacionDto) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.asignacion.finalizar' },
        finalizarAsignacionDto,
      ),
    );
  }
}
