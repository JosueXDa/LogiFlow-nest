import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    TableInheritance,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    Index,
} from 'typeorm';
import { TipoVehiculo, EstadoVehiculo } from '../../../common/enums';

@Entity('vehiculos')
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
@Index(['tipo'])
@Index(['estado'])
export abstract class VehiculoEntrega {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: TipoVehiculo,
    })
    tipo: TipoVehiculo;

    @Column({ unique: true, length: 10 })
    placa: string;

    @Column({ length: 50 })
    marca: string;

    @Column({ length: 50 })
    modelo: string;

    @Column({ type: 'int' })
    año: number;

    @Column({ length: 30 })
    color: string;

    @Column({
        type: 'enum',
        enum: EstadoVehiculo,
        default: EstadoVehiculo.OPERATIVO,
    })
    estado: EstadoVehiculo;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    capacidadKg: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    capacidadM3: number;

    @Column({ type: 'int', default: 0 })
    kilometraje: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    cargaActualKg: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    volumenActualM3: number;

    @Column({ type: 'date', nullable: true })
    ultimaRevision: Date;

    @Column({ type: 'date', nullable: true })
    proximoMant: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    // Métodos abstractos que deben implementar las subclases
    abstract obtenerTiempoEstimado(distanciaKm: number): number;

    abstract puedeRealizarRuta(distanciaKm: number): boolean;

    // Este método es protegido para ser usado internamente
    protected abstract esTipoCompatible(tipoEntrega: string): boolean;

    verificarCompatibilidad(tipoEntrega: string, pesoKg: number, volumenM3: number): boolean {
        if (!this.esTipoCompatible(tipoEntrega)) return false;

        // Validar capacidad disponible
        const pesoDisponible = Number(this.capacidadKg) - Number(this.cargaActualKg);
        const volumenDisponible = Number(this.capacidadM3) - Number(this.volumenActualM3);

        return pesoKg <= pesoDisponible && volumenM3 <= volumenDisponible;
    }
}
