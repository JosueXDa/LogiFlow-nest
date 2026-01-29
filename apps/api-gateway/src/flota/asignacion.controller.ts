import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@Controller('flota/asignaciones')
export class AsignacionController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
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
  async iniciar(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.asignacion.iniciar' }, { id }),
    );
  }

  @Post('finalizar')
  @UseGuards(AuthGuard)
  async finalizar(@Body() finalizarAsignacionDto: any) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.asignacion.finalizar' },
        finalizarAsignacionDto,
      ),
    );
  }
}
