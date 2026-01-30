import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { VehiculoService } from './service/vehiculo.service';
import { CreateVehiculoDto, UpdateVehiculoDto, FindVehiculosDto } from './dto/vehiculo.dto';
import { TipoVehiculo } from '../../common/enums';

@Controller()
export class VehiculoController {
    private readonly logger = new Logger(VehiculoController.name);

    constructor(private readonly vehiculoService: VehiculoService) { }

    @MessagePattern({ cmd: 'fleet.vehiculo.create' })
    async create(@Payload() data: CreateVehiculoDto) {
        try {
            const vehiculo = await this.vehiculoService.create(data);
            return {
                success: true,
                data: vehiculo,
                message: 'Vehículo creado exitosamente',
            };
        } catch (error) {
            throw new RpcException({
                success: false,
                message: error.message,
                statusCode: error.status || 400,
            });
        }
    }

    @MessagePattern({ cmd: 'fleet.vehiculo.findAll' })
    async findAll(@Payload() data: { filters?: FindVehiculosDto; page?: number; limit?: number }) {
        const { filters = {}, page = 1, limit = 10 } = data;
        const result = await this.vehiculoService.findAll(filters, page, limit);
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

    @MessagePattern({ cmd: 'fleet.vehiculo.findOne' })
    async findOne(@Payload() data: { id: string }) {
        try {
            const vehiculo = await this.vehiculoService.findOne(data.id);
            return { success: true, data: vehiculo };
        } catch (error) {
            throw new RpcException({ success: false, message: error.message, statusCode: error.status || 404 });
        }
    }

    @MessagePattern({ cmd: 'fleet.vehiculo.update' })
    async update(@Payload() data: { id: string; dto: UpdateVehiculoDto }) {
        try {
            const vehiculo = await this.vehiculoService.update(data.id, data.dto);
            return { success: true, data: vehiculo, message: 'Vehículo actualizado' };
        } catch (error) {
            throw new RpcException({ success: false, message: error.message, statusCode: error.status || 400 });
        }
    }

    @MessagePattern({ cmd: 'fleet.vehiculo.findDisponiblesPorTipo' })
    async findDisponiblesPorTipo(@Payload() data: { tipo: TipoVehiculo }) {
        const vehiculos = await this.vehiculoService.findDisponiblesPorTipo(data.tipo);
        return { success: true, data: vehiculos };
    }
}
