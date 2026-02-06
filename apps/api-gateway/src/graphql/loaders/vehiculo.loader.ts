import { Injectable, Scope, Inject } from '@nestjs/common';
import DataLoader from 'dataloader';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../../constans';

@Injectable({ scope: Scope.REQUEST })
export class VehiculoLoader {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetClient: ClientProxy,
    ) { }

    public readonly batchVehiculos = new DataLoader(
        async (vehiculoIds: readonly string[]) => {
            // Cargar vehículos en batch para evitar N+1
            const results = await Promise.all(
                vehiculoIds.map(id =>
                    firstValueFrom(this.fleetClient.send({ cmd: 'fleet.vehiculo.findOne' }, { id }))
                        .then(res => res.success ? res.data : null)
                        .catch(() => null)
                )
            );
            return results;
        },
    );
}
