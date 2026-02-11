import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { AsignacionService } from './service/asignacion.service';
import { AsignarRepartidorDto, FinalizarAsignacionDto } from './dto/asignacion.dto';

@Controller()
export class AsignacionController {
    private readonly logger = new Logger(AsignacionController.name);

    constructor(private readonly asignacionService: AsignacionService) { }

    @MessagePattern({ cmd: 'fleet.asignacion.asignar' })
    async asignar(@Payload() dto: AsignarRepartidorDto) {
        try {
            const asignacion = await this.asignacionService.asignarPedido(dto);
            return {
                success: true,
                data: asignacion,
                message: 'Pedido asignado exitosamente',
            };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.asignacion.findAll' })
    async findAll(@Payload() payload: { filters?: any; page?: number; limit?: number }) {
        try {
            const result = await this.asignacionService.findAll(
                payload.filters || {},
                payload.page || 1,
                payload.limit || 10,
            );
            return { success: true, data: result };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.asignacion.iniciar' })
    async iniciar(@Payload() data: { id: string }) {
        try {
            const asignacion = await this.asignacionService.iniciarAsignacion(data.id);
            return { success: true, data: asignacion };
        } catch (error) {
            throw new RpcException({ success: false, message: error.message, statusCode: error.status || 404 });
        }
    }

    @MessagePattern({ cmd: 'fleet.asignacion.finalizar' })
    async finalizar(@Payload() dto: FinalizarAsignacionDto) {
        try {
            const asignacion = await this.asignacionService.finalizarAsignacion(dto);
            return { success: true, data: asignacion };
        } catch (error) {
            throw new RpcException({ success: false, message: error.message, statusCode: error.status || 404 });
        }
    }
}
