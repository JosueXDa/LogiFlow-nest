import { ChildEntity, Column } from 'typeorm';
import { VehiculoEntrega } from './vehiculo-entrega.entity';
import { TipoVehiculo, TipoEntrega } from '../../common/enums';

@ChildEntity(TipoVehiculo.CAMION)
export class Camion extends VehiculoEntrega {
    @Column({ length: 50, nullable: true })
    tipoCamion: string; // "Furgoneta", "Camión 3.5T", "Camión 7.5T"

    @Column({ type: 'int', nullable: true })
    numeroEjes: number;

    @Column({ type: 'boolean', default: false })
    tieneRampa: boolean;

    @Column({ type: 'boolean', default: false })
    tieneRefrigeracion: boolean;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 70.0 })
    velocidadPromedioKmh: number;

    private readonly DISTANCIA_MAXIMA_KM = 1000; // Sin límite práctico

    obtenerTiempoEstimado(distanciaKm: number): number {
        const tiempoBase = (distanciaKm / Number(this.velocidadPromedioKmh)) * 60;
        return Math.ceil(tiempoBase * 1.2); // +20% por paradas y peajes
    }

    puedeRealizarRuta(distanciaKm: number): boolean {
        return distanciaKm <= this.DISTANCIA_MAXIMA_KM;
    }

    protected esTipoCompatible(tipoEntrega: string): boolean {
        // Camiones pueden hacer cualquier tipo de entrega
        return true;
    }
}
