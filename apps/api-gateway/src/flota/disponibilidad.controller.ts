import {
  Controller,
  Get,
  Inject,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@Controller('flota/disponibilidad')
export class DisponibilidadController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) { }

  @Get('zona/:zonaId')
  @UseGuards(AuthGuard)
  @Roles('SUPERVISOR')
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
