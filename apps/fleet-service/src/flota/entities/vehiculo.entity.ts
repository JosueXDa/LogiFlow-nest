import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { IAptitud } from '../interfaces/aptitud.interface';
import { Conductor } from './conductor.entity';

export enum TipoVehiculo {
  MOTORIZADO = 'MOTORIZADO',
  LIVIANO = 'LIVIANO',
  CAMION = 'CAMION',
}

@Entity('vehiculos')
@TableInheritance({
  column: {
    type: 'varchar',
    name: 'tipo',
  },
})
export abstract class Vehiculo implements IAptitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  placa: string;

  @Column({ type: 'varchar', length: 100 })
  modelo: string;

  @Column({
    type: 'enum',
    enum: TipoVehiculo,
  })
  tipo: TipoVehiculo;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  capacidadKg: number;

  @OneToOne(() => Conductor, (conductor) => conductor.vehiculo)
  conductor: Conductor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método abstracto para validar aptitud del vehículo (IAptitud)
  abstract esAptoPara(pesoKg: number): boolean;

  // Implementación de IAptitud
  calcularPorcentajeCapacidad(pesoKg: number): number {
    return (pesoKg / Number(this.capacidadKg)) * 100;
  }
}
