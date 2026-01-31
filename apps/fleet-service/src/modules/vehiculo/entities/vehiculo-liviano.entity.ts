import { ChildEntity, Column } from 'typeorm';
import { VehiculoEntrega } from './vehiculo-entrega.entity';
import { TipoVehiculo, TipoEntrega } from '../../../common/enums';

@ChildEntity(TipoVehiculo.VEHICULO_LIVIANO)
export class VehiculoLiviano extends VehiculoEntrega {
    @Column({ type: 'int', nullable: true })
    numeroPuertas: number;

    @Column({ type: 'boolean', default: false })
    tieneAireAcondicionado: boolean;

    @Column({ type: 'boolean', default: false })
    esPickup: boolean;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 60.0 })
    velocidadPromedioKmh: number;

    private readonly DISTANCIA_MAXIMA_KM = 150;

    obtenerTiempoEstimado(distanciaKm: number): number {
        const tiempoBase = (distanciaKm / Number(this.velocidadPromedioKmh)) * 60;
        return Math.ceil(tiempoBase * 1.15); // +15% por carreteras secundarias
    }

    puedeRealizarRuta(distanciaKm: number): boolean {
        return distanciaKm <= this.DISTANCIA_MAXIMA_KM;
    }

    protected esTipoCompatible(tipoEntrega: string): boolean {
        return (
            tipoEntrega === TipoEntrega.URBANA ||
            tipoEntrega === TipoEntrega.INTERMUNICIPAL
        );
    }
}
