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
                options: {
                    host: process.env.PEDIDOS_SERVICE_HOST || '127.0.0.1',
                    port: parseInt(process.env.PEDIDOS_TCP_PORT || '4004'),
                    retryAttempts: 5,
                    retryDelay: 3000,
                },
            },
            {
                name: MICROSERVICES_CLIENTS.FLEET_SERVICE,
                transport: Transport.TCP,
                options: {
                    host: process.env.FLEET_SERVICE_HOST || '127.0.0.1',
                    port: parseInt(process.env.FLEET_TCP_PORT || '4005'),
                    retryAttempts: 5,
                    retryDelay: 3000,
                },
            },
            {
                name: MICROSERVICES_CLIENTS.BILLING_SERVICE,
                transport: Transport.TCP,
                options: {
                    host: process.env.BILLING_SERVICE_HOST || '127.0.0.1',
                    port: parseInt(process.env.BILLING_TCP_PORT || '4007'),
                    retryAttempts: 5,
                    retryDelay: 3000,
                },
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
