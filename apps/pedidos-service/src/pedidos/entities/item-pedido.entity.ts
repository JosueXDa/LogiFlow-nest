import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';

@Entity('pedido_items')
export class ItemPedido {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pedido, (pedido) => pedido.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @Column({ type: 'uuid' })
  pedidoId: string;

  @Column({ type: 'uuid', nullable: true })
  productoId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  productoSku: string | null;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'float' })
  peso: number;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'uuid', nullable: true })
  reservaId: string | null;
}
