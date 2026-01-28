import { Injectable } from '@nestjs/common';
import { IAsignacionStrategy } from './asignacion.strategy';
import { Repartidor } from '../../../repartidor/entities/repartidor.entity';
import { AsignarRepartidorDto } from '../../dto/asignacion.dto';
import { TipoVehiculo, TipoEntrega } from '../../../common/enums';

@Injectable()
export class IntermunicipalStrategy implements IAsignacionStrategy {
    asignarRepartidor(
        pedido: AsignarRepartidorDto,
        repartidores: Repartidor[]
    ): Repartidor | null {
        const candidatos = repartidores.filter(r =>
            r.vehiculo && r.vehiculo.verificarCompatibilidad(TipoEntrega.INTERMUNICIPAL, pedido.pesoKg, pedido.volumenM3)
        );

        if (candidatos.length === 0) return null;

        // Prioridad: Vehiculo Liviano
        const livianos = candidatos.filter(r => r.vehiculo.tipo === TipoVehiculo.VEHICULO_LIVIANO);
        if (livianos.length > 0) return livianos[0];

        return candidatos[0];
    }
}
