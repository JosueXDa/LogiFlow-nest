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
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import {
  CreateRepartidorDto,
  UpdateRepartidorDto,
  CambiarEstadoRepartidorDto,
  FindRepartidoresQueryDto,
} from '../swagger/dto/fleet.dto';

@ApiTags('Fleet-Repartidores')
@ApiBearerAuth()
@ApiCookieAuth()
@Controller('flota/repartidores')
export class RepartidorController {
  constructor(
    @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
    private readonly fleetServiceClient: ClientProxy,
  ) { }

  @Post()
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Crear repartidor', description: 'Registra un nuevo repartidor en el sistema' })
  @ApiBody({ type: CreateRepartidorDto })
  @ApiResponse({ status: 201, description: 'Repartidor creado exitosamente' })
  async create(@Body() createRepartidorDto: CreateRepartidorDto) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.repartidor.create' },
        { dto: createRepartidorDto, user: {} },
      ),
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Listar repartidores', description: 'Obtiene lista paginada de repartidores con filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado' })
  @ApiQuery({ name: 'zonaId', required: false, description: 'Filtrar por zona (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de repartidores' })
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
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Listar repartidores disponibles', description: 'Obtiene los repartidores disponibles en una zona' })
  @ApiQuery({ name: 'zonaId', required: true, description: 'ID de la zona (UUID)' })
  @ApiResponse({ status: 200, description: 'Lista de repartidores disponibles' })
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
  @Roles('GERENTE', 'ADMIN', 'SUPERVISOR')
  @ApiOperation({ summary: 'Obtener repartidor por ID' })
  @ApiParam({ name: 'id', description: 'ID del repartidor (UUID)' })
  @ApiResponse({ status: 200, description: 'Repartidor encontrado' })
  @ApiResponse({ status: 404, description: 'Repartidor no encontrado' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.repartidor.findOne' }, { id }),
    );
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Actualizar repartidor' })
  @ApiParam({ name: 'id', description: 'ID del repartidor (UUID)' })
  @ApiBody({ type: UpdateRepartidorDto })
  @ApiResponse({ status: 200, description: 'Repartidor actualizado' })
  async update(@Param('id') id: string, @Body() updateRepartidorDto: UpdateRepartidorDto) {
    return firstValueFrom(
      this.fleetServiceClient.send(
        { cmd: 'fleet.repartidor.update' },
        { id, dto: updateRepartidorDto },
      ),
    );
  }

  @Patch(':id/estado')
  @UseGuards(AuthGuard)
  @Roles('REPARTIDOR')
  @ApiOperation({ summary: 'Cambiar estado del repartidor', description: 'Cambia el estado de disponibilidad del repartidor' })
  @ApiParam({ name: 'id', description: 'ID del repartidor (UUID)' })
  @ApiBody({ type: CambiarEstadoRepartidorDto })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  async cambiarEstado(
    @Param('id') id: string,
    @Body() body: CambiarEstadoRepartidorDto,
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
  @Roles('GERENTE', 'ADMIN')
  @ApiOperation({ summary: 'Eliminar repartidor' })
  @ApiParam({ name: 'id', description: 'ID del repartidor (UUID)' })
  @ApiResponse({ status: 200, description: 'Repartidor eliminado' })
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.fleetServiceClient.send({ cmd: 'fleet.repartidor.remove' }, { id }),
    );
  }
}
