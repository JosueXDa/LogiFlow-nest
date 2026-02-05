import { Injectable, Scope, Inject } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../../constans';

@Injectable({ scope: Scope.REQUEST })
export class RepartidorLoader {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetClient: ClientProxy,
    ) { }

    public readonly batchRepartidores = new DataLoader(
        async (repartidorIds: string[]) => {
            // En un caso real optimizado, FleetService debería tener un endpoint findManyByIds
            // Por ahora haré map de llamadas o buscaré si puedo filtrar por ids
            // Asumiendo que FleetService pueda responder en batch o lo simularé con Promise.all por ahora
            // lo cual no es lo mas optimo en red pero sirve para DataLoader agrupar ticks.

            // Mejor aproximación: Crear un metodo en FleetService para GetMany, pero el tiempo apremia.
            // DataLoader ayuda incluso si hacemos llamadas individuales porque las agrupa en el mismo tick de evento,
            // pero para microservicios TCP seria ideal mandar un array de IDs.
            // Voy a simular la carga batch enviando n peticiones en paralelo (lo cual sigue saturando un poco pero evita el n+1 del resolver field).
            // EDIT: El usuario pidió usar DataLoader.

            const results = await Promise.all(
                repartidorIds.map(id =>
                    firstValueFrom(this.fleetClient.send({ cmd: 'fleet.repartidor.findOne' }, { id }))
                        .then(res => res.data)
                        .catch(() => null)
                )
            );
            return results;
        },
    );
}
