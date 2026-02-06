import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { AsignarRepartidorDto, FinalizarAsignacionDto } from '../swagger/dto/fleet.dto';

@ApiTags('Fleet-Asignaciones')
@ApiBearerAuth()
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
