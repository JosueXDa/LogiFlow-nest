import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { EstadoAsignacion } from '../../../common/enums';
import { Repartidor } from '../../repartidor/entities/repartidor.entity';

@Entity('asignaciones')
@Index(['pedidoId'])
@Index(['repartidorId'])
@Index(['estado'])
@Index(['fechaAsignacion'])
export class Asignacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    pedidoId: string; // Referencia al pedido (otro microservicio)

    @ManyToOne(() => Repartidor, (repartidor) => repartidor.asignaciones, {
        eager: true,
    })
    @JoinColumn({ name: 'repartidor_id' })
    repartidor: Repartidor;

    @Column({ type: 'uuid' })
    repartidorId: string;

    @Column({ type: 'timestamp' })
    fechaAsignacion: Date;

    @Column({ type: 'timestamp', nullable: true })
    fechaInicio: Date;

    @Column({ type: 'timestamp', nullable: true })
    fechaFin: Date;

    @Column({
        type: 'enum',
        enum: EstadoAsignacion,
        default: EstadoAsignacion.ASIGNADA,
    })
    estado: EstadoAsignacion;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    distanciaKm: number;

    @Column({ type: 'int', nullable: true })
    tiempoEstimadoMin: number;

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Métodos de negocio
    iniciar(): void {
        this.estado = EstadoAsignacion.EN_CURSO;
        this.fechaInicio = new Date();
    }

    completar(observaciones?: string): void {
        this.estado = EstadoAsignacion.COMPLETADA;
        this.fechaFin = new Date();
        if (observaciones) {
            this.observaciones = observaciones;
        }
    }

    cancelar(motivo: string): void {
        this.estado = EstadoAsignacion.CANCELADA;
        this.observaciones = motivo;
    }

    get duracionMin(): number | null {
        if (!this.fechaInicio || !this.fechaFin) return null;
        return Math.floor(
            (this.fechaFin.getTime() - this.fechaInicio.getTime()) / 60000,
        );
    }
}
