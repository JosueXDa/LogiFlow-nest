import { ChildEntity, Column } from 'typeorm';
import { Vehiculo, TipoVehiculo } from './vehiculo.entity';

/**
 * Vehículo Liviano (Automóvil, Van pequeña)
 * Capacidad: hasta 500kg
 * Ideal para paquetes medianos y múltiples entregas
 */
@ChildEntity(TipoVehiculo.LIVIANO)
export class VehiculoLiviano extends Vehiculo {
  @Column({ type: 'int', nullable: true })
  numeroPuertas: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  tipoCarroceria: string;

  constructor() {
    super();
    this.tipo = TipoVehiculo.LIVIANO;
  }

  /**
   * Un vehículo liviano es apto si el peso no excede 500kg y su capacidad máxima
   */
  esAptoPara(pesoKg: number): boolean {
    const PESO_MAX_LIVIANO = 500;
    return pesoKg <= PESO_MAX_LIVIANO && pesoKg <= Number(this.capacidadKg);
  }
}
