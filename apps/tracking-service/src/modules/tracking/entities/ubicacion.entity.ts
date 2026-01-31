import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('ubicaciones')
@Index(['repartidorId', 'timestamp'])
@Index(['pedidoId', 'timestamp'])
@Index(['rutaId'])
export class Ubicacion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    repartidorId: string;

    @Column({ type: 'uuid', nullable: true })
    pedidoId: string | null;

    @Column({ type: 'uuid', nullable: true })
    rutaId: string | null;

    // Coordenadas GPS
    @Column({ type: 'decimal', precision: 10, scale: 7 })
    latitud: number;

    @Column({ type: 'decimal', precision: 10, scale: 7 })
    longitud: number;

    // Metadata GPS
    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    velocidadKmh: number | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    precision: number | null; // Precisión en metros

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    altitud: number | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    rumbo: number | null; // Dirección en grados (0-360)

    // Metadata del dispositivo
    @Column({ type: 'varchar', length: 50, nullable: true })
    dispositivoId: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    tipoConexion: string | null; // GPS, WIFI, CELLULAR

    @CreateDateColumn()
    timestamp: Date;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;
}
