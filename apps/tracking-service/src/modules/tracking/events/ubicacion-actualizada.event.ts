export class UbicacionActualizadaEvent {
    repartidorId: string;
    pedidoId: string | null;
    latitud: number;
    longitud: number;
    velocidadKmh: number | null;
    precision: number | null;
    timestamp: Date;
}
