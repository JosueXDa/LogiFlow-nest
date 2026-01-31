import {
    Body,
    Controller,
    Delete,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@Controller('flota/zonas')
export class ZonaController {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.FLEET_SERVICE)
        private readonly fleetServiceClient: ClientProxy,
    ) { }

    @Post()
    @UseGuards(AuthGuard)
    async create(@Body() createZonaDto: any) {
        return firstValueFrom(
            this.fleetServiceClient.send(
                { cmd: 'fleet.zona.create' },
                createZonaDto,
            ),
        );
    }

    @Get()
    @UseGuards(AuthGuard)
    async findAll(@Query() query: any) {
        return firstValueFrom(
            this.fleetServiceClient.send({ cmd: 'fleet.zona.findAll' }, query),
        );
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async findOne(@Param('id') id: string) {
        return firstValueFrom(
            this.fleetServiceClient.send({ cmd: 'fleet.zona.findOne' }, { id }),
        );
    }

    @Patch(':id')
    @UseGuards(AuthGuard)
    async update(@Param('id') id: string, @Body() updateZonaDto: any) {
        return firstValueFrom(
            this.fleetServiceClient.send(
                { cmd: 'fleet.zona.update' },
                { id, dto: updateZonaDto },
            ),
        );
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async remove(@Param('id') id: string) {
        return firstValueFrom(
            this.fleetServiceClient.send({ cmd: 'fleet.zona.remove' }, { id }),
        );
    }
}
