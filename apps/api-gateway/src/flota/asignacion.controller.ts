import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@Controller('flota/asignaciones')
export class AsignacionController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('SUPERVISOR')
  async asignar(@Body() asignarRepartidorDto: any) {
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
  async iniciar(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.asignacion.iniciar' }, { id }),
    );
  }

  @Post('finalizar')
  @UseGuards(AuthGuard)
  @Roles('REPARTIDOR')
  async finalizar(@Body() finalizarAsignacionDto: any) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.asignacion.finalizar' },
        finalizarAsignacionDto,
      ),
    );
  }
}
