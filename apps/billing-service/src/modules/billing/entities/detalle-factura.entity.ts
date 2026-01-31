import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Factura } from './factura.entity';

@Entity('detalle_facturas')
export class DetalleFactura {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    facturaId: string;

    @ManyToOne(() => Factura, (factura) => factura.detalles, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'facturaId' })
    factura: Factura;

    @Column({ type: 'int', default: 1 })
    orden: number;

    @Column({ length: 200 })
    concepto: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    @Column({ type: 'decimal', precision: 10, scale: 3, default: 1 })
    cantidad: number;

    @Column({ length: 20, default: 'UNIDAD' })
    unidadMedida: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precioUnitario: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    porcentajeDescuento: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    descuento: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;
}
