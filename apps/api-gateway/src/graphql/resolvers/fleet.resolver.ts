import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { FlotaActivaType, RepartidorType, VehiculoType, ZonaType } from '../types';
import { MICROSERVICES_CLIENTS } from '../../constans';
import { VehiculoLoader } from '../loaders/vehiculo.loader';
import { ZonaLoader } from '../loaders/zona.loader';
import { Roles } from '../../decorators/roles.decorator';
import { AuthGuard } from '../../guards/auth.guard';

// ====== RESOLVER PARA REPARTIDOR ======
@Resolver(() => RepartidorType)
export class RepartidorResolver {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetClient: ClientProxy,
        private readonly vehiculoLoader: VehiculoLoader,
        private readonly zonaLoader: ZonaLoader,
    ) { }

    @Query(() => [RepartidorType], { name: 'repartidores' })
    async getRepartidores(
        @Args('zonaId', { nullable: true }) zonaId?: string,
        @Args('estado', { nullable: true }) estado?: string,
    ) {
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.repartidor.findAll' }, {
                    filters: { zonaId, estado },
                    limit: 1000,
                })
            );

            if (!res.success) return [];
            return res.data || [];
        } catch (e) {
            return [];
        }
    }

    @Query(() => RepartidorType, { name: 'repartidor', nullable: true })
    async getRepartidor(@Args('id') id: string) {
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.repartidor.findOne' }, { id })
            );

            if (!res.success) return null;
            return res.data;
        } catch (e) {
            return null;
        }
    }

    // Resolver Field para Vehiculo (usa DataLoader)
    // Resolver Field para Vehiculo (usa DataLoader)
    @ResolveField(() => VehiculoType, { nullable: true })
    async vehiculo(@Parent() repartidor: any) {
        // Si el servicio ya cargó la relación (como en findAll), devuélvela directamente
        if (repartidor.vehiculo) return repartidor.vehiculo;
        // Si no, usa el DataLoader si existe el ID (nota: vehiculoId puede no existir en la entidad si no se definió explícitamente)
        if (repartidor.vehiculoId) return this.vehiculoLoader.batchVehiculos.load(repartidor.vehiculoId);
        return null;
    }

    // Resolver Field para Zona (usa DataLoader)
    @ResolveField(() => ZonaType, { nullable: true })
    async zona(@Parent() repartidor: any) {
        if (repartidor.zona) return repartidor.zona;
        if (repartidor.zonaId) return this.zonaLoader.batchZonas.load(repartidor.zonaId);
        return null;
    }
}

// ====== RESOLVER PARA VEHICULO ======
@Resolver(() => VehiculoType)
export class VehiculoResolver {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetClient: ClientProxy,
    ) { }

    @Query(() => [VehiculoType], { name: 'vehiculos' })
    async getVehiculos(
        @Args('tipo', { nullable: true }) tipo?: string,
        @Args('estado', { nullable: true }) estado?: string,
    ) {
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.vehiculo.findAll' }, {
                    filters: { tipo, estado },
                    limit: 1000,
                })
            );

            if (!res.success) return [];
            return res.data || [];
        } catch (e) {
            return [];
        }
    }

    @Query(() => VehiculoType, { name: 'vehiculo', nullable: true })
    async getVehiculo(@Args('id') id: string) {
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.vehiculo.findOne' }, { id })
            );

            if (!res.success) return null;
            return res.data;
        } catch (e) {
            return null;
        }
    }
}

// ====== RESOLVER PARA ZONA ======
@Resolver(() => ZonaType)
export class ZonaResolver {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetClient: ClientProxy,
    ) { }

    @Query(() => [ZonaType], { name: 'zonas' })
    async getZonas() {
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.zona.findAll' }, {})
            );

            if (!res.success) return [];
            return res.data || [];
        } catch (e) {
            return [];
        }
    }

    @Query(() => ZonaType, { name: 'zona', nullable: true })
    async getZona(@Args('id') id: string) {
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.zona.findOne' }, { id })
            );

            if (!res.success) return null;
            return res.data;
        } catch (e) {
            return null;
        }
    }

    // Resolver Field para contar repartidores
    @ResolveField(() => Number, { nullable: true })
    async totalRepartidores(@Parent() zona: any) {
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.repartidor.findAll' }, {
                    filters: { zonaId: zona.id },
                    limit: 1000,
                })
            );

            if (!res.success) return 0;
            return res.data?.length || 0;
        } catch (e) {
            return 0;
        }
    }
}

// ====== RESOLVER PARA FLOTA (KPIs) ======
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
        try {
            const res = await firstValueFrom(
                this.fleetClient.send({ cmd: 'fleet.repartidor.findAll' }, {
                    filters: { zonaId },
                    limit: 1000,
                })
            );

            if (!res.success) {
                return { total: 0, disponibles: 0, enRuta: 0 };
            }

            const repartidores = res.data || [];
            const total = repartidores.length;
            const disponibles = repartidores.filter((r: any) => r.estado === 'DISPONIBLE').length;
            const enRuta = repartidores.filter((r: any) => r.estado === 'EN_RUTA' || r.estado === 'OCUPADO').length;

            return { total, disponibles, enRuta };
        } catch (e) {
            return { total: 0, disponibles: 0, enRuta: 0 };
        }
    }
}
