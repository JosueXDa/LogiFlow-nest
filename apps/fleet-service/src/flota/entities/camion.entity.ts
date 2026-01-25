import { ChildEntity, Column } from 'typeorm';
import { Vehiculo, TipoVehiculo } from './vehiculo.entity';

/**
 * Vehículo tipo Camión
 * Capacidad: más de 500kg
 * Ideal para cargas pesadas y entregas voluminosas
 */
@ChildEntity(TipoVehiculo.CAMION)
export class Camion extends Vehiculo {
  @Column({ type: 'int', nullable: true })
  numeroEjes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volumenM3: number;

  constructor() {
    super();
    this.tipo = TipoVehiculo.CAMION;
  }

  /**
   * Un camión es apto para cualquier peso que no exceda su capacidad máxima
   */
  esAptoPara(pesoKg: number): boolean {
    return pesoKg <= Number(this.capacidadKg);
  }
}
