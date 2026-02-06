import { Controller, Post, Get, Param, Body, Query, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { Roles } from '../decorators/roles.decorator';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';
import { UpdateLocationDto, IniciarRutaDto, HistorialQueryDto } from '../swagger/dto/tracking.dto';

@ApiTags('Tracking')
@ApiBearerAuth()
@Controller('tracking')
export class TrackingController {
    constructor(
        @Inject('TRACKING_SERVICE')
        private readonly trackingClient: ClientProxy,
    ) { }

    @Post('track')
    @UseGuards(AuthGuard)
    @Roles('REPARTIDOR')
    @ApiOperation({ summary: 'Actualizar ubicación', description: 'Registra la ubicación actual del repartidor' })
    @ApiBody({ type: UpdateLocationDto })
    @ApiResponse({ status: 200, description: 'Ubicación actualizada' })
    async updateLocation(@Body() dto: UpdateLocationDto) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.actualizar_ubicacion' }, dto),
        );
    }

    @Get('repartidor/:id/ubicacion')
    @UseGuards(AuthGuard)
    @Roles('CLIENTE', 'SUPERVISOR', 'GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Obtener última ubicación', description: 'Obtiene la última ubicación conocida del repartidor' })
    @ApiParam({ name: 'id', description: 'ID del repartidor (UUID)' })
    @ApiResponse({ status: 200, description: 'Ubicación encontrada' })
    async getUltimaUbicacion(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send(
                { cmd: 'tracking.obtener_ultima_ubicacion' },
                id,
            ),
        );
    }

    @Get('repartidor/:id/historial')
    @UseGuards(AuthGuard)
    @Roles('SUPERVISOR', 'GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Obtener historial de ubicaciones', description: 'Obtiene el historial de ubicaciones de un repartidor' })
    @ApiParam({ name: 'id', description: 'ID del repartidor (UUID)' })
    @ApiResponse({ status: 200, description: 'Historial de ubicaciones' })
    async getHistorial(@Param('id') id: string, @Query() query: HistorialQueryDto) {
        return firstValueFrom(
            this.trackingClient.send(
                { cmd: 'tracking.obtener_historial' },
                { repartidorId: id, ...query },
            ),
        );
    }

    @Get('repartidor/:id/ruta-activa')
    @UseGuards(AuthGuard)
    @Roles('SUPERVISOR', 'GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Obtener ruta activa', description: 'Obtiene la ruta activa actual del repartidor' })
    @ApiParam({ name: 'id', description: 'ID del repartidor (UUID)' })
    @ApiResponse({ status: 200, description: 'Ruta activa encontrada' })
    @ApiResponse({ status: 404, description: 'No hay ruta activa' })
    async getRutaActiva(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.obtener_ruta_activa' }, id),
        );
    }

    @Post('ruta/iniciar')
    @UseGuards(AuthGuard)
    @Roles('REPARTIDOR')
    @ApiOperation({ summary: 'Iniciar ruta', description: 'Inicia una nueva ruta de entrega' })
    @ApiBody({ type: IniciarRutaDto })
    @ApiResponse({ status: 201, description: 'Ruta iniciada' })
    async iniciarRuta(@Body() dto: IniciarRutaDto) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.iniciar_ruta' }, dto),
        );
    }

    @Post('ruta/:id/finalizar')
    @UseGuards(AuthGuard)
    @Roles('REPARTIDOR')
    @ApiOperation({ summary: 'Finalizar ruta', description: 'Finaliza una ruta de entrega activa' })
    @ApiParam({ name: 'id', description: 'ID de la ruta (UUID)' })
    @ApiResponse({ status: 200, description: 'Ruta finalizada' })
    async finalizarRuta(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.finalizar_ruta' }, id),
        );
    }

    @Post('ruta/:id/cancelar')
    @UseGuards(AuthGuard)
    @Roles('REPARTIDOR')
    @ApiOperation({ summary: 'Cancelar ruta', description: 'Cancela una ruta de entrega activa' })
    @ApiParam({ name: 'id', description: 'ID de la ruta (UUID)' })
    @ApiResponse({ status: 200, description: 'Ruta cancelada' })
    async cancelarRuta(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.cancelar_ruta' }, id),
        );
    }

    @Get('ruta/:id')
    @UseGuards(AuthGuard)
    @Roles('REPARTIDOR', 'SUPERVISOR', 'GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Obtener ruta por ID' })
    @ApiParam({ name: 'id', description: 'ID de la ruta (UUID)' })
    @ApiResponse({ status: 200, description: 'Ruta encontrada' })
    @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
    async getRutaById(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.obtener_ruta' }, id),
        );
    }
}
