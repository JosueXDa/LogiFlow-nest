import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateZonaDto } from '../dto/create-zona.dto';
import { UpdateZonaDto } from '../dto/update-zona.dto';
import { Zona } from '../entities/zona.entity';
import { FindZonasDto } from '../dto/find-zonas.dto';

@Injectable()
export class ZonaService {
    private readonly logger = new Logger(ZonaService.name);

    constructor(
        @InjectRepository(Zona)
        private readonly zonaRepository: Repository<Zona>,
    ) { }

    async create(createZonaDto: CreateZonaDto): Promise<Zona> {
        const zona = this.zonaRepository.create(createZonaDto);
        return await this.zonaRepository.save(zona);
    }

    async findAll(filters: FindZonasDto): Promise<Zona[]> {
        const query = this.zonaRepository.createQueryBuilder('zona');

        if (filters.nombre) {
            query.andWhere('zona.nombre LIKE :nombre', { nombre: `%${filters.nombre}%` });
        }

        return await query.getMany();
    }

    async findOne(id: string): Promise<Zona> {
        const zona = await this.zonaRepository.findOne({ where: { id } });
        if (!zona) {
            throw new NotFoundException(`Zona con ID ${id} no encontrada`);
        }
        return zona;
    }

    async update(id: string, updateZonaDto: UpdateZonaDto): Promise<Zona> {
        const zona = await this.findOne(id);
        Object.assign(zona, updateZonaDto);
        return await this.zonaRepository.save(zona);
    }

    async remove(id: string): Promise<void> {
        const zona = await this.findOne(id);
        await this.zonaRepository.softRemove(zona);
    }
}
