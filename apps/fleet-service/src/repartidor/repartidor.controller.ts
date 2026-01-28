import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { RepartidorService } from './service/repartidor.service';
import { CreateRepartidorDto, UpdateRepartidorDto, FindRepartidoresDto } from './dto/repartidor.dto';
import { EstadoRepartidor } from '../common/enums';

@Controller()
export class RepartidorController {
    private readonly logger = new Logger(RepartidorController.name);

    constructor(private readonly repartidorService: RepartidorService) { }

    @MessagePattern({ cmd: 'fleet.repartidor.create' })
    async create(@Payload() data: { dto: CreateRepartidorDto; user: any }) {
        this.logger.log(`Creating repartidor: ${data.dto.nombre}`);

        try {
            const repartidor = await this.repartidorService.create(data.dto);

            return {
                success: true,
                data: repartidor,
                message: 'Repartidor creado exitosamente',
            };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.repartidor.findAll' })
    async findAll(
        @Payload()
        data: {
            filters?: FindRepartidoresDto;
            page?: number;
            limit?: number;
        },
    ) {
        const { filters = {}, page = 1, limit = 10 } = data;

        const result = await this.repartidorService.findAll(filters, page, limit);

        return {
            success: true,
            data: result.data,
            meta: {
                total: result.total,
                page,
                limit,
                totalPages: Math.ceil(result.total / limit),
            },
        };
    }

    @MessagePattern({ cmd: 'fleet.repartidor.findOne' })
    async findOne(@Payload() data: { id: string }) {
        try {
            const repartidor = await this.repartidorService.findOne(data.id);

            return {
                success: true,
                data: repartidor,
            };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 404,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.repartidor.update' })
    async update(
        @Payload() data: { id: string; dto: UpdateRepartidorDto },
    ) {
        try {
            const repartidor = await this.repartidorService.update(
                data.id,
                data.dto,
            );

            return {
                success: true,
                data: repartidor,
                message: 'Repartidor actualizado exitosamente',
            };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.repartidor.cambiarEstado' })
    async cambiarEstado(
        @Payload()
        data: {
            id: string;
            estado: EstadoRepartidor;
            motivo?: string;
        },
    ) {
        try {
            const repartidor = await this.repartidorService.cambiarEstado(
                data.id,
                data.estado,
                data.motivo,
            );

            return {
                success: true,
                data: repartidor,
                message: 'Estado cambiado exitosamente',
            };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.repartidor.remove' })
    async remove(@Payload() data: { id: string }) {
        try {
            await this.repartidorService.remove(data.id);

            return {
                success: true,
                message: 'Repartidor eliminado exitosamente',
            };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.repartidor.findDisponiblesPorZona' })
    async findDisponiblesPorZona(@Payload() data: { zonaId: string }) {
        const repartidores =
            await this.repartidorService.findDisponiblesPorZona(data.zonaId);

        return {
            success: true,
            data: repartidores,
        };
    }
}
