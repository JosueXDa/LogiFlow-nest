import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToOne,
    JoinColumn,
    Index,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { EstadoRepartidor, TipoLicencia } from '../../../common/enums';
import { VehiculoEntrega } from '../../vehiculo/entities/vehiculo-entrega.entity';
import { Asignacion } from '../../asignacion/entities/asignacion.entity';
import { Zona } from '../../zona/entities/zona.entity';

@Entity('repartidores')
@Index(['estado'])
@Index(['zonaId'])
export class Repartidor {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    nombre: string;

    @Column({ length: 100 })
    apellido: string;

    @Column({ length: 10, unique: true })
    cedula: string;

    @Column({ length: 15 })
    telefono: string;

    @Column({ length: 100, unique: true })
    email: string;

    @Column({ length: 20 })
    licencia: string;

    @Column({
        type: 'enum',
        enum: TipoLicencia,
    })
    tipoLicencia: TipoLicencia;

    @Column({
        type: 'enum',
        enum: EstadoRepartidor,
        default: EstadoRepartidor.DISPONIBLE,
    })
    estado: EstadoRepartidor;

    @ManyToOne(() => Zona, (zona) => zona.repartidores)
    @JoinColumn({ name: 'zona_id' })
    zona: Zona;

    @Column({ type: 'uuid', name: 'zona_id' })
    zonaId: string;

    @OneToOne(() => VehiculoEntrega, { nullable: true })
    @JoinColumn({ name: 'vehiculo_id' })
    vehiculo: VehiculoEntrega;

    @Column({ type: 'uuid', nullable: true })
    vehiculoId: string;

    @OneToMany(() => Asignacion, asignacion => asignacion.repartidor)
    asignaciones: Asignacion[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    cambiarEstado(nuevoEstado: EstadoRepartidor) {
        this.estado = nuevoEstado;
    }
}
