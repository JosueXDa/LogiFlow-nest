import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@Controller('flota/repartidores')
export class RepartidorController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(@Body() createRepartidorDto: any) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.repartidor.create' },
        { dto: createRepartidorDto, user: {} }, // User info might need to be extracted from request if available, passing empty for now
      ),
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('estado') estado?: string,
    @Query('zonaId') zonaId?: string,
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.repartidor.findAll' },
        {
          filters: { estado, zonaId },
          page,
          limit,
        },
      ),
    );
  }

  @Get('disponibles')
  @UseGuards(AuthGuard)
  async findDisponiblesPorZona(@Query('zonaId') zonaId: string) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.repartidor.findDisponiblesPorZona' },
        { zonaId },
      ),
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.repartidor.findOne' }, { id }),
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  async update(@Param('id') id: string, @Body() updateRepartidorDto: any) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.repartidor.update' },
        { id, dto: updateRepartidorDto },
      ),
    );
  }

  @Patch(':id/estado')
  @UseGuards(AuthGuard)
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: { estado: string; motivo?: string },
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.repartidor.cambiarEstado' },
        {
          id,
          estado: body.estado,
          motivo: body.motivo,
        },
      ),
    );
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.repartidor.remove' }, { id }),
    );
  }
}
