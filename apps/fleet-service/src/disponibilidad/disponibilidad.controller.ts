import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DisponibilidadService } from './disponibilidad.service';
import { TipoVehiculo } from '../common/enums';

@Controller()
export class DisponibilidadController {
    constructor(private readonly disponibilidadService: DisponibilidadService) { }

    @MessagePattern({ cmd: 'fleet.disponibilidad.consultarPorZona' })
    async consultarPorZona(@Payload() data: { zonaId: string; tipoVehiculo?: TipoVehiculo }) {
        const result = await this.disponibilidadService.consultarPorZona(data.zonaId, data.tipoVehiculo);
        return {
            success: true,
            data: result,
        };
    }
}
