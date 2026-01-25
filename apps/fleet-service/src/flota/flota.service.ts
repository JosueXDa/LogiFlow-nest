import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import {
  Conductor,
  EstadoConductor,
  Vehiculo,
  TipoVehiculo,
  Motorizado,
  VehiculoLiviano,
  Camion,
} from './entities';
import {
  CreateConductorDto,
  UpdateConductorStatusDto,
  UpdateUbicacionDto,
} from './dto';
import {
  FLOTA_EVENT_CLIENT,
  RADIO_BUSQUEDA_KM,
  TIEMPO_MINUTOS_POR_KM,
} from './flota.constants';

@Injectable()
export class FlotaService {
  constructor(
    @InjectRepository(Conductor)
    private readonly conductorRepository: Repository<Conductor>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    @Inject(FLOTA_EVENT_CLIENT)
    private readonly eventClient: ClientProxy,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Registra un nuevo conductor con su vehículo en el sistema
   */
  async registrarConductor(dto: CreateConductorDto): Promise<Conductor> {
    // Crear el vehículo según su tipo usando el patrón Factory
    let vehiculo: Vehiculo;

    switch (dto.vehiculo.tipo) {
      case TipoVehiculo.MOTORIZADO:
        vehiculo = this.vehiculoRepository.create({
          ...dto.vehiculo,
          cilindraje: dto.vehiculo.cilindraje,
        } as Motorizado);
        break;
      case TipoVehiculo.LIVIANO:
        vehiculo = this.vehiculoRepository.create({
          ...dto.vehiculo,
          numeroPuertas: dto.vehiculo.numeroPuertas,
          tipoCarroceria: dto.vehiculo.tipoCarroceria,
        } as VehiculoLiviano);
        break;
      case TipoVehiculo.CAMION:
        vehiculo = this.vehiculoRepository.create({
          ...dto.vehiculo,
          numeroEjes: dto.vehiculo.numeroEjes,
          volumenM3: dto.vehiculo.volumenM3,
        } as Camion);
        break;
      default:
        throw new BadRequestException('Tipo de vehículo no válido');
    }

    // Crear el conductor
    const conductor = this.conductorRepository.create({
      usuarioId: dto.usuarioId,
      nombre: dto.nombre,
      zonaOperacionId: dto.zonaOperacionId,
      estado: EstadoConductor.FUERA_DE_SERVICIO,
      latitud: dto.latitud,
      longitud: dto.longitud,
      vehiculo: vehiculo,
    });

    const savedConductor = await this.conductorRepository.save(conductor);

    // Emitir evento de auditoría
    this.eventClient.emit('conductor.registrado', {
      conductorId: savedConductor.id,
      nombre: savedConductor.nombre,
      tipoVehiculo: vehiculo.tipo,
      placa: vehiculo.placa,
    });

    return savedConductor;
  }

  /**
   * Busca conductores disponibles en una zona y tipo de vehículo
   */
  async listarConductores(
    zonaId?: string,
    estado?: EstadoConductor,
  ): Promise<Conductor[]> {
    const query = this.conductorRepository.createQueryBuilder('conductor');

    query.leftJoinAndSelect('conductor.vehiculo', 'vehiculo');

    if (zonaId) {
      query.andWhere('conductor.zonaOperacionId = :zonaId', { zonaId });
    }

    if (estado) {
      query.andWhere('conductor.estado = :estado', { estado });
    }

    return await query.getMany();
  }

  /**
   * Obtiene un conductor por su ID
   */
  async obtenerConductor(id: string): Promise<Conductor> {
    const conductor = await this.conductorRepository.findOne({
      where: { id },
      relations: ['vehiculo'],
    });

    if (!conductor) {
      throw new NotFoundException('Conductor no encontrado');
    }

    return conductor;
  }

  /**
   * Actualiza el estado de un conductor (DISPONIBLE, OCUPADO, FUERA_DE_SERVICIO)
   */
  async actualizarEstadoConductor(
    id: string,
    dto: UpdateConductorStatusDto,
  ): Promise<Conductor> {
    const conductor = await this.obtenerConductor(id);

    conductor.estado = dto.estado;
    const savedConductor = await this.conductorRepository.save(conductor);

    this.eventClient.emit('conductor.estado.actualizado', {
      conductorId: savedConductor.id,
      nuevoEstado: savedConductor.estado,
    });

    return savedConductor;
  }

  /**
   * Actualiza la ubicación GPS del conductor
   */
  async actualizarUbicacion(
    id: string,
    dto: UpdateUbicacionDto,
  ): Promise<Conductor> {
    const conductor = await this.obtenerConductor(id);

    conductor.latitud = dto.latitud;
    conductor.longitud = dto.longitud;

    return await this.conductorRepository.save(conductor);
  }

  /**
   * LÓGICA CORE: Asigna un conductor a un pedido según criterios inteligentes
   * - Busca conductores disponibles
   * - Filtra por tipo de vehículo compatible
   * - Ordena por distancia al origen
   * - Usa transacción ACID para evitar race conditions
   */
  async asignarConductorAPedido(payload: {
    pedidoId: string;
    origen: { latitud: number; longitud: number };
    tipoVehiculo: TipoVehiculo;
    pesoKg: number;
  }): Promise<void> {
    const { pedidoId, origen, tipoVehiculo, pesoKg } = payload;

    // Usar transacción para evitar que dos pedidos tomen el mismo conductor
    await this.dataSource.transaction(async (manager) => {
      // Buscar conductores disponibles con el tipo de vehículo requerido (o superior)
      const conductoresDisponibles = await manager
        .getRepository(Conductor)
        .createQueryBuilder('conductor')
        .leftJoinAndSelect('conductor.vehiculo', 'vehiculo')
        .where('conductor.estado = :estado', {
          estado: EstadoConductor.DISPONIBLE,
        })
        .andWhere('vehiculo.tipo = :tipo', { tipo: tipoVehiculo })
        .andWhere('conductor.latitud IS NOT NULL')
        .andWhere('conductor.longitud IS NOT NULL')
        .getMany();

      if (conductoresDisponibles.length === 0) {
        // No hay conductores disponibles
        this.eventClient.emit('asignacion.fallida', {
          pedidoId,
          razon: `No hay conductores disponibles con vehículo tipo ${tipoVehiculo}`,
        });
        return;
      }

      // Filtrar por capacidad usando el método esAptoPara (POO)
      const conductoresAptos = conductoresDisponibles.filter((conductor) =>
        conductor.vehiculo.esAptoPara(pesoKg),
      );

      if (conductoresAptos.length === 0) {
        this.eventClient.emit('asignacion.fallida', {
          pedidoId,
          razon: `No hay conductores con capacidad suficiente para ${pesoKg}kg`,
        });
        return;
      }

      // Calcular distancias y ordenar por cercanía
      const conductoresConDistancia = conductoresAptos.map((conductor) => ({
        conductor,
        distancia: conductor.calcularDistancia(origen.latitud, origen.longitud),
      }));

      conductoresConDistancia.sort((a, b) => a.distancia - b.distancia);

      // Filtrar por radio de búsqueda
      const conductoresCercanos = conductoresConDistancia.filter(
        (c) => c.distancia <= RADIO_BUSQUEDA_KM,
      );

      if (conductoresCercanos.length === 0) {
        this.eventClient.emit('asignacion.fallida', {
          pedidoId,
          razon: `No hay conductores en un radio de ${RADIO_BUSQUEDA_KM}km`,
        });
        return;
      }

      // Seleccionar el conductor más cercano
      const conductorSeleccionado = conductoresCercanos[0];

      // Bloquear al conductor (cambiar estado a OCUPADO)
      conductorSeleccionado.conductor.estado = EstadoConductor.OCUPADO;
      await manager.save(conductorSeleccionado.conductor);

      // Calcular tiempo estimado de llegada
      const tiempoMinutos = Math.ceil(
        conductorSeleccionado.distancia * TIEMPO_MINUTOS_POR_KM[tipoVehiculo],
      );

      // Emitir evento de conductor asignado
      this.eventClient.emit('conductor.asignado', {
        pedidoId,
        conductorId: conductorSeleccionado.conductor.id,
        nombreConductor: conductorSeleccionado.conductor.nombre,
        placaVehiculo: conductorSeleccionado.conductor.vehiculo.placa,
        coordenadasIniciales: {
          lat: Number(conductorSeleccionado.conductor.latitud),
          lng: Number(conductorSeleccionado.conductor.longitud),
        },
        tiempoEstimadoLlegada: tiempoMinutos,
      });
    });
  }

  /**
   * Libera un conductor cuando se cancela o completa un pedido
   */
  async liberarConductor(conductorId: string): Promise<void> {
    const conductor = await this.obtenerConductor(conductorId);

    if (conductor.estado === EstadoConductor.OCUPADO) {
      conductor.estado = EstadoConductor.DISPONIBLE;
      await this.conductorRepository.save(conductor);

      this.eventClient.emit('conductor.liberado', {
        conductorId: conductor.id,
      });
    }
  }
}
