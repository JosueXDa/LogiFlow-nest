import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Repartidor } from '../../repartidor/entities/repartidor.entity';

@Entity('zonas')
export class Zona {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;

    // Simplificamos coordenadas como JSON o string por ahora
    @Column({ type: 'text', nullable: true })
    coordenadas: string;

    @OneToMany(() => Repartidor, (repartidor) => repartidor.zona)
    repartidores: Repartidor[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
