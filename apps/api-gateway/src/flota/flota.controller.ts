import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { firstValueFrom } from 'rxjs';

@Controller('flota')
export class FlotaController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private fleetServiceClient: ClientProxy,
  ) {}

  @Post('conductores')
  @UseGuards(AuthGuard)
  async registrarConductor(@Body() createConductorDto: any) {
    return firstValueFrom(
      this.fleetServiceClient.send('registrar_conductor', createConductorDto),
    );
  }

  @Get('conductores')
  @UseGuards(AuthGuard)
  async listarConductores(
    @Query('zonaId') zonaId?: string,
    @Query('estado') estado?: string,
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send('listar_conductores', {
        zonaId,
        estado,
      }),
    );
  }

  @Get('conductores/:id')
  @UseGuards(AuthGuard)
  async obtenerConductor(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send('obtener_conductor', id),
    );
  }

  @Patch('conductores/:id/estado')
  @UseGuards(AuthGuard)
  async actualizarEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: any,
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send('actualizar_estado_conductor', {
        id,
        dto: updateEstadoDto,
      }),
    );
  }

  @Patch('conductores/:id/ubicacion')
  @UseGuards(AuthGuard)
  async actualizarUbicacion(
    @Param('id') id: string,
    @Body() updateUbicacionDto: any,
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send('actualizar_ubicacion_conductor', {
        id,
        dto: updateUbicacionDto,
      }),
    );
  }
}
