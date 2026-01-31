import { Injectable } from '@nestjs/common';
import { RepartidorService } from '../repartidor/service/repartidor.service';
import { TipoVehiculo, EstadoRepartidor } from '../../common/enums';
import { FindRepartidoresDto } from '../repartidor/dto/repartidor.dto';

@Injectable()
export class DisponibilidadService {
    constructor(private readonly repartidorService: RepartidorService) { }

    async consultarPorZona(zonaId: string, tipoVehiculo?: TipoVehiculo) {
        // This requires a more complex query than findAll exposed, but we can reuse findAll for now or add method directly in RepartidorService.
        // Ideally RepartidorService (or Repository) should have a count method by status.

        // Using findAll helper
        const result = await this.repartidorService.findAll({ zonaId }, 1, 1000); // Get all in zone (up to 1000)
        const repartidores = result.data;

        const total = repartidores.length;
        const disponibles = repartidores.filter(r => r.estado === EstadoRepartidor.DISPONIBLE).length;
        const enRuta = repartidores.filter(r => r.estado === EstadoRepartidor.OCUPADO).length;
        // For maintenance, we might need to check vehicle status? Or Repartidor status INACTIVO?
        const inactivos = repartidores.filter(r => r.estado === EstadoRepartidor.INACTIVO || r.estado === EstadoRepartidor.SUSPENDIDO).length;

        return {
            zonaId,
            total,
            disponibles,
            enRuta,
            inactivos,
            repartidores: repartidores.filter(r => r.estado === EstadoRepartidor.DISPONIBLE) // Return available ones
        };
    }
}
