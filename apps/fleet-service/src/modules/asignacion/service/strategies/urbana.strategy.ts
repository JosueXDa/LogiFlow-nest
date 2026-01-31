import { Injectable } from '@nestjs/common';
import { IAsignacionStrategy } from './asignacion.strategy';
import { Repartidor } from '../../../repartidor/entities/repartidor.entity';
import { AsignarRepartidorDto } from '../../dto/asignacion.dto';
import { TipoVehiculo, TipoEntrega } from '../../../../common/enums';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UrbanaStrategy implements IAsignacionStrategy {
    asignarRepartidor(
        pedido: AsignarRepartidorDto,
        repartidores: Repartidor[]
    ): Repartidor | null {
        // Filtrar repartidores con vehículos compatibles (Motorizado o Liviano)
        const candidatos = repartidores.filter(r =>
            r.vehiculo && r.vehiculo.verificarCompatibilidad(TipoEntrega.URBANA, pedido.pesoKg, pedido.volumenM3)
        );

        if (candidatos.length === 0) return null;

        // Prioridad: Motorizados primero para urbano
        const motorizados = candidatos.filter(r => r.vehiculo.tipo === TipoVehiculo.MOTORIZADO);
        if (motorizados.length > 0) {
            // Simple logic: return the first one. Real logic would use GPS distance.
            return motorizados[0];
        }

        return candidatos[0];
    }
}
