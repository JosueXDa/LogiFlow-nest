import { ChildEntity, Column } from 'typeorm';
import { Vehiculo, TipoVehiculo } from './vehiculo.entity';

/**
 * Vehículo tipo Motorizado (Moto)
 * Capacidad: hasta 30kg
 * Ideal para paquetes pequeños y entregas rápidas en zonas urbanas
 */
@ChildEntity(TipoVehiculo.MOTORIZADO)
export class Motorizado extends Vehiculo {
  @Column({ type: 'varchar', length: 50, nullable: true })
  cilindraje: string;

  constructor() {
    super();
    this.tipo = TipoVehiculo.MOTORIZADO;
  }

  /**
   * Un motorizado es apto si el peso no excede 30kg y su capacidad máxima
   */
  esAptoPara(pesoKg: number): boolean {
    const PESO_MAX_MOTORIZADO = 30;
    return pesoKg <= PESO_MAX_MOTORIZADO && pesoKg <= Number(this.capacidadKg);
  }
}
