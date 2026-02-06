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
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import { CreateZonaDto, UpdateZonaDto } from '../swagger/dto/fleet.dto';

@ApiTags('Fleet-Zonas')
@ApiBearerAuth()
@Controller('flota/zonas')
export class ZonaController {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetServiceClient: ClientProxy,
    ) { }

    @Post()
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Crear zona', description: 'Crea una nueva zona de cobertura' })
    @ApiBody({ type: CreateZonaDto })
    @ApiResponse({ status: 201, description: 'Zona creada exitosamente' })
    async create(@Body() createZonaDto: CreateZonaDto) {
        return firstValueFrom(
            this.fleetServiceClient.send(
                { cmd: 'fleet.zona.create' },
                createZonaDto,
            ),
        );
    }

    @Get()
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN', 'SUPERVISOR')
    @ApiOperation({ summary: 'Listar zonas', description: 'Obtiene todas las zonas de cobertura' })
    @ApiResponse({ status: 200, description: 'Lista de zonas' })
    async findAll(@Query() query: any) {
        return firstValueFrom(
            this.fleetServiceClient.send({ cmd: 'fleet.zona.findAll' }, query),
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Obtener zona por ID' })
    @ApiParam({ name: 'id', description: 'ID de la zona (UUID)' })
    @ApiResponse({ status: 200, description: 'Zona encontrada' })
    @ApiResponse({ status: 404, description: 'Zona no encontrada' })
    async findOne(@Param('id') id: string) {
        return firstValueFrom(
            this.fleetServiceClient.send({ cmd: 'fleet.zona.findOne' }, { id }),
        );
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Actualizar zona' })
    @ApiParam({ name: 'id', description: 'ID de la zona (UUID)' })
    @ApiBody({ type: UpdateZonaDto })
    @ApiResponse({ status: 200, description: 'Zona actualizada' })
    async update(@Param('id') id: string, @Body() updateZonaDto: UpdateZonaDto) {
        return firstValueFrom(
            this.fleetServiceClient.send(
                { cmd: 'fleet.zona.update' },
                { id, dto: updateZonaDto },
            ),
        );
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Eliminar zona' })
    @ApiParam({ name: 'id', description: 'ID de la zona (UUID)' })
    @ApiResponse({ status: 200, description: 'Zona eliminada' })
    async remove(@Param('id') id: string) {
        return firstValueFrom(
            this.fleetServiceClient.send({ cmd: 'fleet.zona.remove' }, { id }),
        );
    }
}
