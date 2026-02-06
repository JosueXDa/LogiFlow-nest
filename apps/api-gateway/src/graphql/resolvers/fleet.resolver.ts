import { Resolver, Query, Args } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FlotaActivaType } from '../types';
import { MICROSERVICES_CLIENTS } from '../../constans';
import { Roles } from '../../decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';

@Resolver()
export class FleetResolver {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetClient: ClientProxy,
    ) { }

    @Query(() => FlotaActivaType, { name: 'flotaActiva' })
    @UseGuards(AuthGuard)
    @Roles('SUPERVISOR', 'GERENTE', 'ADMIN')
    async getFlotaActiva(@Args('zonaId') zonaId: string) {
        // Necesito conteos.
        // Opcion 1: Endpoint especifico en FleetService.
        // Opcion 2: findAll con filtro zonaId, y contar acá.

        try {
            // Usar findAll del FleetService
            const res = await firstValueFrom(this.fleetClient.send({ cmd: 'fleet.repartidor.findAll' }, {
                filters: { zonaId }, // Asumiendo que mi DTO soporta esto
                limit: 1000 // Traer suficientes
            }));

            if (!res.success) throw new Error(res.message);

            const repartidores = res.data;

            const total = repartidores.length;
            const disponibles = repartidores.filter((r: any) => r.estado === 'DISPONIBLE').length;
            const enRuta = repartidores.filter((r: any) => r.estado === 'EN_RUTA' || r.estado === 'OCUPADO').length;

            return {
                total,
                disponibles,
                enRuta
            };

        } catch (e) {
            return { total: 0, disponibles: 0, enRuta: 0 };
        }
    }
}
