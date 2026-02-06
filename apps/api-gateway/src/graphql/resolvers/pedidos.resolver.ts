import { Resolver, Query, Args, ResolveField, Parent, Int } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PedidoType, RepartidorType, FacturaType } from '../types';
import { MICROSERVICES_CLIENTS } from '../../constans';
import { RepartidorLoader } from '../loaders/repartidor.loader';
import { Roles } from '../../decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../guards/auth.guard';

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

        // Si el filtro de zona es requerido y no esta en pedidos-service,
        // post-filtro aqui seria necesario si pedidos-service devuelve todo.
        // Pero asumimos que pedidos-service maneja el filtro.

        const pedidos = await firstValueFrom(this.pedidosClient.send(pattern, payload));

        // Mapping manual si es necesario, pero PedidoType coincide mucho con la entidad
        return pedidos.map(p => ({
            ...p,
            cliente: { nombre: 'Cliente Mock' }, // Pedido Service guarda clienteId, necesito nombre. Mock por ahora o llamar AuthService.
            destino: p.direccionDestino || p.destino, // Normalizar nombres
            // id, estado ya vienen
            createdAt: p.createdAt // Para calculo de tiempo
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
            destino: pedido.direccionDestino || pedido.destino,
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
        // Logica simple: Si tiempoTranscurrido > 45 mins (ejemplo), es retraso.
        // O usar un campo estimado de la DB.
        // Asumiremos 0 por defecto si no hay estimatedDeliveryTime
        return 0;
    }

    @ResolveField(() => FacturaType, { nullable: true })
    async factura(@Parent() pedido: any) {
        // pattern: billing.obtener_factura_por_pedido
        try {
            const res = await firstValueFrom(this.billingClient.send({ cmd: 'billing.obtener_factura_por_pedido' }, pedido.id));
            if (res && res.success) return res.data;
            return null;
        } catch (e) {
            return null;
        }
    }
}

import { InputType, Field } from '@nestjs/graphql';

@InputType()
class PedidosFilterInput {
    @Field({ nullable: true })
    zonaId?: string;

    @Field({ nullable: true })
    estado?: string;
}
