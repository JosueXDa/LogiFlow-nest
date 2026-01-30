import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { DetalleFactura } from './detalle-factura.entity';

export enum EstadoFactura {
    BORRADOR = 'BORRADOR',
    EMITIDA = 'EMITIDA',
    PAGADA = 'PAGADA',
    CANCELADA = 'CANCELADA',
    ANULADA = 'ANULADA',
}

export enum TipoPago {
    EFECTIVO = 'EFECTIVO',
    TARJETA = 'TARJETA',
    TRANSFERENCIA = 'TRANSFERENCIA',
    CREDITO = 'CREDITO',
}

@Entity('facturas')
@Index(['pedidoId'])
@Index(['clienteId'])
@Index(['estado'])
@Index(['createdAt'])
export class Factura {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 50 })
    @Index()
    numeroFactura: string;

    @Column({ type: 'uuid' })
    pedidoId: string;

    @Column({ type: 'uuid' })
    clienteId: string;

    @Column({ length: 200 })
    clienteNombre: string;

    @Column({ nullable: true, length: 13 })
    clienteRuc: string;

    @Column({ nullable: true, length: 500 })
    clienteDireccion: string;

    @Column({ type: 'uuid', nullable: true })
    zonaId: string;

    @Column({ nullable: true, length: 100 })
    zonaNombre: string;

    @Column({
        type: 'enum',
        enum: EstadoFactura,
        default: EstadoFactura.BORRADOR,
    })
    estado: EstadoFactura;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    descuento: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    iva: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 12.0 })
    porcentajeIva: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'enum', enum: TipoPago, nullable: true })
    tipoPago: TipoPago;

    @Column({ type: 'timestamp', nullable: true })
    fechaPago: Date;

    @Column({ nullable: true, length: 100 })
    referenciaPago: string;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @OneToMany(() => DetalleFactura, (detalle) => detalle.factura, {
        cascade: true,
        eager: true,
    })
    detalles: DetalleFactura[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    deletedAt: Date;
}
