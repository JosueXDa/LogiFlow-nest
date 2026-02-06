import { Injectable, Scope, Inject } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../../constans';

@Injectable({ scope: Scope.REQUEST })
export class ZonaLoader {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetClient: ClientProxy,
    ) { }

    public readonly batchZonas = new DataLoader(
        async (zonaIds: readonly string[]) => {
            // Cargar zonas en batch para evitar N+1
            const results = await Promise.all(
                zonaIds.map(id =>
                    firstValueFrom(this.fleetClient.send({ cmd: 'fleet.zona.findOne' }, { id }))
                        .then(res => res.success ? res.data : null)
                        .catch(() => null)
                )
            );
            return results;
        },
    );
}
