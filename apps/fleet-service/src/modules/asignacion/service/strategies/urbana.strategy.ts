import { Injectable, Logger } from '@nestjs/common';
import { IAsignacionStrategy } from './asignacion.strategy';
import { Repartidor } from '../../../repartidor/entities/repartidor.entity';
import { AsignarRepartidorDto } from '../../dto/asignacion.dto';
import { TipoVehiculo, TipoEntrega } from '../../../../common/enums';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UrbanaStrategy implements IAsignacionStrategy {
    private readonly logger = new Logger(UrbanaStrategy.name);
    
    asignarRepartidor(
        pedido: AsignarRepartidorDto,
        repartidores: Repartidor[]
    ): Repartidor | null {
        this.logger.log(`🔍 Filtrando ${repartidores.length} repartidores para entrega URBANA`);
        
        // Filtrar repartidores con vehículos compatibles (Motorizado o Liviano)
        const candidatos = repartidores.filter(r => {
            if (!r.vehiculo) {
                this.logger.warn(`   ⚠️  ${r.nombre} no tiene vehículo asignado`);
                return false;
            }
            
            const compatible = r.vehiculo.verificarCompatibilidad(TipoEntrega.URBANA, pedido.pesoKg, pedido.volumenM3);
            this.logger.debug(
                `   ${compatible ? '✅' : '❌'} ${r.nombre} (${r.vehiculo.tipo}) - ` +
                `Compatible: ${compatible}`
            );
            return compatible;
        });

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
