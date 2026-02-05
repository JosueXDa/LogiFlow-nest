import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MICROSERVICES_CLIENTS } from '../constans';
import { PedidosResolver } from './resolvers/pedidos.resolver';
import { FleetResolver } from './resolvers/fleet.resolver';
import { BillingResolver } from './resolvers/billing.resolver';
import { RepartidorLoader } from './loaders/repartidor.loader';

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            playground: true,
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
        PedidosResolver,
        FleetResolver,
        BillingResolver,
        RepartidorLoader,
    ],
})
export class GraphqlModule { }
