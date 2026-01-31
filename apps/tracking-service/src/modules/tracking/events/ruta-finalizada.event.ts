export class RutaFinalizadaEvent {
    rutaId: string;
    pedidoId: string;
    repartidorId: string;
    distanciaRecorridaKm: number | null;
    duracionMinutos: number | null;
    timestamp: Date;
}
