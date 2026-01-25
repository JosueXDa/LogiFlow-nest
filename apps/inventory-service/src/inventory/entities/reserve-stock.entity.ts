import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  RelationId,
} from 'typeorm';
import { Producto } from './product.entity';

export enum EstadoReserva {
  PENDIENTE = 'PENDIENTE', // Reservado temporalmente (Saga iniciada)
  CONFIRMADA = 'CONFIRMADA', // Pedido entregado/finalizado (Stock descontado)
  CANCELADA = 'CANCELADA', // Pedido falló (Stock devuelto)
}

@Entity('reservas_stock')
export class ReservaStock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID del pedido que originó la reserva (Viene del PedidoService via RabbitMQ)
  @Column('uuid')
  pedidoId: string;

  @ManyToOne(() => Producto, (producto) => producto.reservas, {
    cascade: false, // Evitar que al guardar Reserva se guarde automáticamente el Producto
  })
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  // RelationId expone el ID de la relación sin necesidad de cargarla
  @RelationId((reserva: ReservaStock) => reserva.producto)
  productoId: string;

  @Column('int')
  cantidad: number;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.PENDIENTE,
  })
  estado: EstadoReserva;

  // Fecha de expiración (opcional): Si la reserva dura > 30 mins sin confirmar, se libera cron job
  @Column({ type: 'timestamp', nullable: true })
  expiraEn: Date;

  @CreateDateColumn()
  createdAt: Date;
}
