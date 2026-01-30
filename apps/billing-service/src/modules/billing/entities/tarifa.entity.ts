import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

export enum TipoEntrega {
    URBANA = 'URBANA',
    INTERMUNICIPAL = 'INTERMUNICIPAL',
    NACIONAL = 'NACIONAL',
}

export enum TipoVehiculo {
    MOTORIZADO = 'MOTORIZADO',
    VEHICULO_LIVIANO = 'VEHICULO_LIVIANO',
    CAMION = 'CAMION',
}

@Entity('tarifas')
@Index(['tipoEntrega', 'tipoVehiculo', 'activa'])
export class Tarifa {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: TipoEntrega })
    tipoEntrega: TipoEntrega;

    @Column({ type: 'enum', enum: TipoVehiculo })
    tipoVehiculo: TipoVehiculo;

    @Column({ length: 100 })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    descripcion: string;

    // ==========================================
    // COSTOS BASE
    // ==========================================
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    tarifaBase: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    costoPorKm: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    costoPorKg: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    costoMinimo: number;

    // ==========================================
    // RECARGOS Y AJUSTES
    // ==========================================
    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    tarifaUrgente: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    factorZona: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    porcentajeDescuentoVolumen: number;

    // ==========================================
    // CONFIGURACIÓN
    // ==========================================
    @Column({ type: 'int', nullable: true })
    kmIncluidos: number; // Ej: primeros 5 km incluidos

    @Column({ type: 'int', nullable: true })
    kgIncluidos: number; // Ej: primeros 10 kg incluidos

    @Column({ type: 'boolean', default: true })
    activa: boolean;

    @Column({ type: 'timestamp', nullable: true })
    validaDesde: Date;

    @Column({ type: 'timestamp', nullable: true })
    validaHasta: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
