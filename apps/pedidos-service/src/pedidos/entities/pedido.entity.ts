import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ItemPedido } from './item-pedido.entity';

export enum PedidoEstado {
  PENDIENTE = 'PENDIENTE',
  CONFIRMADO = 'CONFIRMADO',
  ASIGNADO = 'ASIGNADO',
  EN_RUTA = 'EN_RUTA',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

export enum TipoVehiculo {
  MOTO = 'MOTO',
  LIVIANO = 'LIVIANO',
  CAMION = 'CAMION',
}

@Entity('pedidos')
export class Pedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  clienteId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  repartidorId: string | null;

  @Column({
    type: 'enum',
    enum: PedidoEstado,
    default: PedidoEstado.PENDIENTE,
  })
  estado: PedidoEstado;

  @Column({ type: 'enum', enum: TipoVehiculo })
  tipoVehiculo: TipoVehiculo;

  @Column({ type: 'jsonb' })
  direccionOrigen: { lat: number; lng: number; direccion: string };

  @Column({ type: 'jsonb' })
  direccionDestino: { lat: number; lng: number; direccion: string };

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioTotal: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  codigoSeguridad: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  evidenciaEntrega: string | null;

  @OneToMany(() => ItemPedido, (item) => item.pedido, {
    cascade: ['insert', 'update'],
    eager: false,
  })
  items: ItemPedido[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
