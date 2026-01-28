import { Injectable } from '@nestjs/common';
import { IAsignacionStrategy } from './asignacion.strategy';
import { Repartidor } from '../../../repartidor/entities/repartidor.entity';
import { AsignarRepartidorDto } from '../../dto/asignacion.dto';
import { TipoVehiculo, TipoEntrega } from '../../../common/enums';

@Injectable()
export class NacionalStrategy implements IAsignacionStrategy {
    asignarRepartidor(
        pedido: AsignarRepartidorDto,
        repartidores: Repartidor[]
    ): Repartidor | null {
        const candidatos = repartidores.filter(r =>
            r.vehiculo && r.vehiculo.verificarCompatibilidad(TipoEntrega.NACIONAL, pedido.pesoKg, pedido.volumenM3)
        );

        if (candidatos.length === 0) return null;

        // Prioridad: Camion
        const camiones = candidatos.filter(r => r.vehiculo.tipo === TipoVehiculo.CAMION);
        if (camiones.length > 0) return camiones[0];

        return candidatos[0];
    }
}
