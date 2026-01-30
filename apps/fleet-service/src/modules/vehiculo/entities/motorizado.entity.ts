import { ChildEntity, Column } from 'typeorm';
import { VehiculoEntrega } from './vehiculo-entrega.entity';
import { TipoVehiculo, TipoEntrega } from '../../../common/enums';

@ChildEntity(TipoVehiculo.MOTORIZADO)
export class Motorizado extends VehiculoEntrega {
    @Column({ type: 'int', nullable: true })
    cilindradaCc: number;

    @Column({ type: 'boolean', default: false })
    tieneTopCase: boolean;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 40.0 })
    velocidadPromedioKmh: number;

    private readonly DISTANCIA_MAXIMA_KM = 20;

    obtenerTiempoEstimado(distanciaKm: number): number {
        const tiempoBase = (distanciaKm / Number(this.velocidadPromedioKmh)) * 60;
        return Math.ceil(tiempoBase * 1.1); // +10% por tráfico urbano
    }

    puedeRealizarRuta(distanciaKm: number): boolean {
        return distanciaKm <= this.DISTANCIA_MAXIMA_KM;
    }

    protected esTipoCompatible(tipoEntrega: string): boolean {
        return tipoEntrega === TipoEntrega.URBANA;
    }
}
