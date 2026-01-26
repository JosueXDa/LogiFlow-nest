export class ConductorAsignadoEvent {
    pedidoId: string;
    conductorId: string;
    nombreConductor: string;
    placaVehiculo: string;
    coordenadasIniciales: {
        lat: number;
        lng: number;
    };
    tiempoEstimadoLlegada: number; // en minutos
}
