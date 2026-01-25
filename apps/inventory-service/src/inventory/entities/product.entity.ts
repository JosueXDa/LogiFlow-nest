import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ReservaStock } from './reserve-stock.entity';

@Entity('productos')
export class Producto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string; // Código único de producto (ej. "PKG-001")

  @Column()
  nombre: string;

  @Column('text', { nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precio: number;

  // Importante para LogiFlow: El peso determina si se usa Moto, Auto o Camión
  @Column('float')
  pesoKg: number;

  // Cantidad real física en almacén
  @Column('int', { default: 0 })
  stockTotal: number;

  // Cantidad "bloqueada" por pedidos en proceso (Saga)
  @Column('int', { default: 0 })
  stockReservado: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relación para saber qué reservas tiene este producto
  @OneToMany(() => ReservaStock, (reserve) => reserve.producto, {
    cascade: false, // Evitar que al guardar Producto se guarden automáticamente las Reservas
  })
  reservas: ReservaStock[];

  // Getter útil: Stock que realmente puedo vender ahora mismo
  get stockDisponible(): number {
    return this.stockTotal - this.stockReservado;
  }
}
