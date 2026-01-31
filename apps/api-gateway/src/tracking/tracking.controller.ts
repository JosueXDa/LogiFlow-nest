import { Controller, Post, Get, Param, Body, Query, UseGuards, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthGuard } from '../guards/auth.guard';

@Controller('tracking')
export class TrackingController {
    constructor(
        @Inject('TRACKING_SERVICE')
        private readonly trackingClient: ClientProxy,
    ) { }

    @Post('track')
    @UseGuards(AuthGuard)
    async updateLocation(@Body() dto: any) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.actualizar_ubicacion' }, dto),
        );
    }

    @Get('repartidor/:id/ubicacion')
    @UseGuards(AuthGuard)
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
    async getHistorial(@Param('id') id: string, @Query() query: any) {
        return firstValueFrom(
            this.trackingClient.send(
                { cmd: 'tracking.obtener_historial' },
                { repartidorId: id, ...query },
            ),
        );
    }

    @Get('repartidor/:id/ruta-activa')
    @UseGuards(AuthGuard)
    async getRutaActiva(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.obtener_ruta_activa' }, id),
        );
    }

    @Post('ruta/iniciar')
    @UseGuards(AuthGuard)
    async iniciarRuta(@Body() dto: any) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.iniciar_ruta' }, dto),
        );
    }

    @Post('ruta/:id/finalizar')
    @UseGuards(AuthGuard)
    async finalizarRuta(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.finalizar_ruta' }, id),
        );
    }

    @Post('ruta/:id/cancelar')
    @UseGuards(AuthGuard)
    async cancelarRuta(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.cancelar_ruta' }, id),
        );
    }

    @Get('ruta/:id')
    @UseGuards(AuthGuard)
    async getRutaById(@Param('id') id: string) {
        return firstValueFrom(
            this.trackingClient.send({ cmd: 'tracking.obtener_ruta' }, id),
        );
    }
}
