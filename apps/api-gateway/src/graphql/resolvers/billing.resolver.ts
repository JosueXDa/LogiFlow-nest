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
        try {
            // pattern: billing.reporte_diario
            const res = await firstValueFrom(this.billingClient.send({ cmd: 'billing.reporte_diario' }, { fecha, zonaId }));

            if (res && res.success && res.data && res.data.resumen) {
                const resumen = res.data.resumen;
                const totalPedidos = resumen.cantidadTotal ?? 0;
                const totalFacturado = resumen.totalFacturado ?? 0;

                return {
                    totalPedidos: totalPedidos,
                    costoPromedioEntrega: totalPedidos > 0 ? (totalFacturado / totalPedidos) : 0,
                    tasaCumplimiento: totalPedidos > 0 ? ((resumen.cantidadPagada + resumen.cantidadEmitida) / totalPedidos) * 100 : 0,
                    ingresosTotales: totalFacturado
                };
            }
        } catch (e) {
            console.error('Error getting KPI:', e);
        }

        return {
            totalPedidos: 0,
            costoPromedioEntrega: 0,
            tasaCumplimiento: 0,
            ingresosTotales: 0
        };
    }
}
