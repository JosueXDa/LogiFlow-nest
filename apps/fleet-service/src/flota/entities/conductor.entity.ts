import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Vehiculo } from './vehiculo.entity';

export enum EstadoConductor {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADO = 'OCUPADO',
  FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
}

/**
 * Representa un conductor/repartidor en el sistema
 * Mantiene la información del conductor, su estado actual
 * y su ubicación para asignación de pedidos
 */
@Entity('conductores')
export class Conductor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  usuarioId: string;

  @Column({ type: 'varchar', length: 100 })
  nombre: string;

  @Column({
    type: 'enum',
    enum: EstadoConductor,
    default: EstadoConductor.FUERA_DE_SERVICIO,
  })
  estado: EstadoConductor;

  // Ubicación actual del conductor (usaremos PostGIS geometry para consultas espaciales)
  // Por simplicidad inicial, usaremos columnas separadas
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number;

  @Column({ type: 'varchar', length: 50 })
  zonaOperacionId: string;

  @OneToOne(() => Vehiculo, (vehiculo) => vehiculo.conductor, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  vehiculo: Vehiculo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Calcula la distancia aproximada a un punto usando fórmula de Haversine
   * @param lat Latitud de destino
   * @param lng Longitud de destino
   * @returns Distancia en kilómetros
   */
  calcularDistancia(lat: number, lng: number): number {
    if (!this.latitud || !this.longitud) {
      return Infinity;
    }

    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat - Number(this.latitud));
    const dLng = this.toRad(lng - Number(this.longitud));
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(Number(this.latitud))) *
        Math.cos(this.toRad(lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Verifica si el conductor está disponible para asignación
   */
  estaDisponible(): boolean {
    return this.estado === EstadoConductor.DISPONIBLE;
  }
}
