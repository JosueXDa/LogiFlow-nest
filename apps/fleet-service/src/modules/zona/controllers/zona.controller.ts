import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateZonaDto } from '../dto/create-zona.dto';
import { FindZonasDto } from '../dto/find-zonas.dto';
import { UpdateZonaDto } from '../dto/update-zona.dto';
import { ZonaService } from '../services/zona.service';

@Controller()
export class ZonaController {
    private readonly logger = new Logger(ZonaController.name);

    constructor(private readonly zonaService: ZonaService) { }

    @MessagePattern({ cmd: 'fleet.zona.create' })
    async create(@Payload() createZonaDto: CreateZonaDto) {
        this.logger.log(`Creando zona: ${JSON.stringify(createZonaDto)}`);
        return await this.zonaService.create(createZonaDto);
    }

    @MessagePattern({ cmd: 'fleet.zona.findAll' })
    async findAll(@Payload() filters: FindZonasDto) {
        return await this.zonaService.findAll(filters);
    }

    @MessagePattern({ cmd: 'fleet.zona.findOne' })
    async findOne(@Payload() payload: { id: string }) {
        return await this.zonaService.findOne(payload.id);
    }

    @MessagePattern({ cmd: 'fleet.zona.update' })
    async update(@Payload() payload: { id: string; dto: UpdateZonaDto }) {
        return await this.zonaService.update(payload.id, payload.dto);
    }

    @MessagePattern({ cmd: 'fleet.zona.remove' })
    async remove(@Payload() payload: { id: string }) {
        return await this.zonaService.remove(payload.id);
    }
}
