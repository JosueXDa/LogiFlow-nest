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
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { CreateVehiculoDto, UpdateVehiculoDto } from '../swagger/dto/fleet.dto';

@ApiTags('Fleet-Vehiculos')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('flota/vehiculos')
export class VehiculoController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Crear vehículo', description: 'Registra un nuevo vehículo en la flota' })
  @ApiBody({ type: CreateVehiculoDto })
  @ApiResponse({ status: 201, description: 'Vehículo creado exitosamente' })
  async create(@Body() createVehiculoDto: CreateVehiculoDto) {
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
  @ApiOperation({ summary: 'Listar vehículos', description: 'Obtiene lista paginada de vehículos con filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'placa', required: false, description: 'Filtrar por placa' })
  @ApiQuery({ name: 'tipo', required: false, description: 'Filtrar por tipo de vehículo' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos' })
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
  @ApiOperation({ summary: 'Listar vehículos disponibles', description: 'Obtiene los vehículos disponibles por tipo' })
  @ApiQuery({ name: 'tipo', required: true, description: 'Tipo de vehículo' })
  @ApiResponse({ status: 200, description: 'Lista de vehículos disponibles' })
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
  @ApiOperation({ summary: 'Obtener vehículo por ID' })
  @ApiParam({ name: 'id', description: 'ID del vehículo (UUID)' })
  @ApiResponse({ status: 200, description: 'Vehículo encontrado' })
  @ApiResponse({ status: 404, description: 'Vehículo no encontrado' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.vehiculo.findOne' }, { id }),
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar vehículo' })
  @ApiParam({ name: 'id', description: 'ID del vehículo (UUID)' })
  @ApiBody({ type: UpdateVehiculoDto })
  @ApiResponse({ status: 200, description: 'Vehículo actualizado' })
  async update(@Param('id') id: string, @Body() updateVehiculoDto: UpdateVehiculoDto) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.vehiculo.update' },
        { id, dto: updateVehiculoDto },
      ),
    );
  }
}
