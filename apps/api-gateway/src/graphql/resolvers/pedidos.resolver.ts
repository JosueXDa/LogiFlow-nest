import { Resolver, Query, Args, ResolveField, Parent, Int, InputType, Field } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PedidoType, RepartidorType, FacturaType } from '../types';
import { MICROSERVICES_CLIENTS } from '../../constans';
import { RepartidorLoader } from '../loaders/repartidor.loader';
import { Roles } from '../../decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';

// InputType debe estar antes de ser usado
@InputType()
class PedidosFilterInput {
    @Field({ nullable: true })
    zonaId?: string;

    @Field({ nullable: true })
    estado?: string;
}

@Resolver(() => PedidoType)
export class PedidosResolver {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.PEDIDOS_SERVICE)
        private readonly pedidosClient: ClientProxy,
        @Inject(MICROSERVICES_CLIENTS.BILLING_SERVICE)
        private readonly billingClient: ClientProxy,
        private readonly repartidorLoader: RepartidorLoader,
    ) { }

    @Query(() => [PedidoType], { name: 'pedidos' })
    @UseGuards(AuthGuard)
    @Roles('SUPERVISOR', 'GERENTE', 'ADMIN')
    async getPedidos(
        @Args('filtro', { type: () => PedidosFilterInput, nullable: true }) filtro: PedidosFilterInput,
    ) {
        // filtro: { zonaId: "UIO-NORTE", estado: EN_RUTA }
        const pattern = 'find_all_pedidos';
        const payload = {
            zonaId: filtro?.zonaId,
            estado: filtro?.estado
        };

        const pedidos = await firstValueFrom(this.pedidosClient.send(pattern, payload));

        // Mapping manual
        return pedidos.map(p => ({
            ...p,
            cliente: { nombre: 'Cliente Mock' },
            origen: p.direccionOrigen,
            destino: p.direccionDestino,
            createdAt: p.createdAt
        }));
    }

    @Query(() => PedidoType, { name: 'pedido' })
    @UseGuards(AuthGuard)
    @Roles('CLIENTE', 'REPARTIDOR', 'SUPERVISOR', 'GERENTE', 'ADMIN')
    async getPedido(@Args('id') id: string) {
        const pedido = await firstValueFrom(this.pedidosClient.send('get_pedido', id));
        return {
            ...pedido,
            cliente: { nombre: 'Cliente Mock' },
            origen: pedido.direccionOrigen,
            destino: pedido.direccionDestino,
        };
    }

    @ResolveField(() => RepartidorType, { nullable: true })
    async repartidor(@Parent() pedido: any) {
        if (!pedido.repartidorId) return null;
        return this.repartidorLoader.batchRepartidores.load(pedido.repartidorId);
    }

    @ResolveField(() => String)
    tiempoTranscurrido(@Parent() pedido: any) {
        if (!pedido.items?.[0]?.createdAt && !pedido.createdAt) return '00:00:00';
        const start = new Date(pedido.createdAt || pedido.items?.[0]?.createdAt).getTime(); // Fallback
        const now = Date.now();
        const diff = now - start;

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    @ResolveField(() => Int)
    retrasoMin(@Parent() pedido: any) {
        return 0;
    }

    @ResolveField(() => FacturaType, { nullable: true })
    async factura(@Parent() pedido: any) {
        try {
            const res = await firstValueFrom(this.billingClient.send({ cmd: 'billing.obtener_factura_por_pedido' }, pedido.id));
            if (res && res.success) return res.data;
            return null;
        } catch (e) {
            return null;
        }
    }
}


