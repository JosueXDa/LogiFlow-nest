import { Repartidor } from '../../../repartidor/entities/repartidor.entity';
import { AsignarRepartidorDto } from '../../dto/asignacion.dto';

export interface IAsignacionStrategy {
    asignarRepartidor(
        pedido: AsignarRepartidorDto,
        repartidores: Repartidor[]
    ): Repartidor | null;
}
