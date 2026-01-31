export class PedidoCreadoEvent {
    pedidoId: string;
    clienteId: string;
    clienteNombre: string;
    clienteRuc?: string;
    clienteDireccion?: string;
    tipoEntrega: string;
    tipoVehiculo: string;
    distanciaKm: number;
    pesoKg: number;
    esUrgente: boolean;
    zonaId?: string;
    zonaNombre?: string;
    timestamp: string;
    eventId: string;
}
