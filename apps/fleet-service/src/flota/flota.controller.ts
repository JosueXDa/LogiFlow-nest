import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlotaService } from './flota.service';
import {
  CreateConductorDto,
  UpdateConductorStatusDto,
  UpdateUbicacionDto,
} from './dto';
import { EstadoConductor } from './entities';

/**
 * Controlador para comunicación TCP con el API Gateway
 * Expone endpoints para gestión administrativa de la flota
 */
@Controller()
export class FlotaController {
  constructor(private readonly flotaService: FlotaService) {}

  /**
   * POST /api/flota/conductores - Registrar nuevo conductor
   */
  @MessagePattern('registrar_conductor')
  async registrarConductor(@Payload() dto: CreateConductorDto) {
    return await this.flotaService.registrarConductor(dto);
  }

  /**
   * GET /api/flota/conductores - Listar conductores
   */
  @MessagePattern('listar_conductores')
  async listarConductores(
    @Payload() payload: { zonaId?: string; estado?: EstadoConductor },
  ) {
    return await this.flotaService.listarConductores(
      payload.zonaId,
      payload.estado,
    );
  }

  /**
   * GET /api/flota/conductores/:id - Obtener conductor por ID
   */
  @MessagePattern('obtener_conductor')
  async obtenerConductor(@Payload() id: string) {
    return await this.flotaService.obtenerConductor(id);
  }

  /**
   * PATCH /api/flota/conductores/:id/estado - Actualizar estado del conductor
   */
  @MessagePattern('actualizar_estado_conductor')
  async actualizarEstado(
    @Payload()
    payload: {
      id: string;
      dto: UpdateConductorStatusDto;
    },
  ) {
    return await this.flotaService.actualizarEstadoConductor(
      payload.id,
      payload.dto,
    );
  }

  /**
   * PATCH /api/flota/conductores/:id/ubicacion - Actualizar ubicación del conductor
   */
  @MessagePattern('actualizar_ubicacion_conductor')
  async actualizarUbicacion(
    @Payload()
    payload: {
      id: string;
      dto: UpdateUbicacionDto;
    },
  ) {
    return await this.flotaService.actualizarUbicacion(payload.id, payload.dto);
  }
}
