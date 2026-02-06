import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../constans';
import { PedidosResolver } from './resolvers/pedidos.resolver';
import { FleetResolver, RepartidorResolver, VehiculoResolver, ZonaResolver } from './resolvers/fleet.resolver';
import { BillingResolver } from './resolvers/billing.resolver';
import { RepartidorLoader } from './loaders/repartidor.loader';
import { VehiculoLoader } from './loaders/vehiculo.loader';
import { ZonaLoader } from './loaders/zona.loader';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: true,
            introspection: true, // Habilitar introspección para desarrollo
        }),
        ClientsModule.register([
            {
                name: MICROSERVICES_CLIENTS.PEDIDOS_SERVICE,
                transport: Transport.TCP,
                options: { port: 4004 },
            },
            {
                name: MICROSERVICES_CLIENTS.FLEET_SERVICE,
                transport: Transport.TCP,
                options: { port: 4005 },
            },
            {
                name: MICROSERVICES_CLIENTS.BILLING_SERVICE,
                transport: Transport.TCP,
                options: { port: 4007 },
            },
        ]),
    ],
    providers: [
        // Resolvers
        PedidosResolver,
        FleetResolver,
        RepartidorResolver,
        VehiculoResolver,
        ZonaResolver,
        BillingResolver,
        // Data Loaders (REQUEST scoped)
        RepartidorLoader,
        VehiculoLoader,
        ZonaLoader,
    ],
})
export class GraphqlModule { }
