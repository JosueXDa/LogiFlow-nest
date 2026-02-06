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
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@Controller('flota/vehiculos')
export class VehiculoController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  async create(@Body() createVehiculoDto: any) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.vehiculo.create' },
        createVehiculoDto,
      ),
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('placa') placa?: string,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
  ) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.vehiculo.findAll' },
        {
          filters: { placa, tipo, estado },
          page,
          limit,
        },
      ),
    );
  }

  @Get('disponibles')
  @UseGuards(AuthGuard)
  @Roles('SUPERVISOR')
  async findDisponiblesPorTipo(@Query('tipo') tipo: string) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.vehiculo.findDisponiblesPorTipo' },
        { tipo },
      ),
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.vehiculo.findOne' }, { id }),
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  async update(@Param('id') id: string, @Body() updateVehiculoDto: any) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.vehiculo.update' },
        { id, dto: updateVehiculoDto },
      ),
    );
  }
}
