import { Resolver, Query, Args } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { KpiDiarioType } from '../types';
import { MICROSERVICES_CLIENTS } from '../../constans';
import { Roles } from '../../decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';

@Resolver()
export class BillingResolver {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.BILLING_SERVICE)
        private readonly billingClient: ClientProxy,
    ) { }

    @Query(() => KpiDiarioType, { name: 'kpiDiario' })
    @UseGuards(AuthGuard)
    @Roles('SUPERVISOR', 'GERENTE', 'ADMIN')
    async getKpiDiario(
        @Args('fecha') fecha: string,
        @Args('zonaId', { nullable: true }) zonaId?: string
    ) {
        // pattern: billing.reporte_diario
        const res = await firstValueFrom(this.billingClient.send({ cmd: 'billing.reporte_diario' }, { fecha, zonaId }));

        if (res.success) {
            return res.data;
            // Espera: { totalPedidos, costoPromedioEntrega, tasaCumplimiento, ingresosTotales }
            // Si BillingService no devuelve exactamente esto, habria que adaptar.
        }
        return {
            totalPedidos: 0,
            costoPromedioEntrega: 0,
            tasaCumplimiento: 0,
            ingresosTotales: 0
        };
    }
}
