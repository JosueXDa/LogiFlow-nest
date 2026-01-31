import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';
import { EstadoRuta } from '../tracking.constants';

@Entity('rutas')
@Index(['repartidorId', 'estado'])
@Index(['pedidoId'])
export class Ruta {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    pedidoId: string;

    @Column({ type: 'uuid' })
    repartidorId: string;

    @Column({
        type: 'enum',
        enum: EstadoRuta,
        default: EstadoRuta.EN_CURSO,
    })
    estado: EstadoRuta;

    // Origen
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    origenLat: number;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    origenLng: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    origenDireccion: string | null;

    // Destino
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    destinoLat: number;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    destinoLng: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    destinoDireccion: string | null;

    // Métricas
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    distanciaRecorridaKm: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    distanciaEsperadaKm: number | null;

    @Column({ type: 'int', nullable: true })
    duracionMinutos: number | null;

    @Column({ type: 'int', nullable: true })
    duracionEsperadaMinutos: number | null;

    // Timestamps
    @CreateDateColumn()
    fechaInicio: Date;

    @Column({ type: 'timestamp', nullable: true })
    fechaFin: Date | null;

    @UpdateDateColumn()
    updatedAt: Date;
}
