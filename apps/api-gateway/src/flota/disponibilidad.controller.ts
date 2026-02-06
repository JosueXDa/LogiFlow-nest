import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@ApiTags('Fleet-Disponibilidad')
@ApiBearerAuth()
@Controller('flota/disponibilidad')
export class DisponibilidadController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) { }

  @Get('zona/:zonaId')
  @UseGuards(AuthGuard)
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Consultar disponibilidad por zona', description: 'Obtiene la disponibilidad de repartidores y vehículos en una zona' })
  @ApiParam({ name: 'zonaId', description: 'ID de la zona (UUID)' })
  @ApiQuery({ name: 'tipoVehiculo', required: false, description: 'Filtrar por tipo de vehículo' })
  @ApiResponse({ status: 200, description: 'Información de disponibilidad' })
  async consultarPorZona(
    @Param('zonaId') zonaId: string,
    @Query('tipoVehiculo') tipoVehiculo?: string,
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.disponibilidad.consultarPorZona' },
        { zonaId, tipoVehiculo },
      ),
    );
  }
}
