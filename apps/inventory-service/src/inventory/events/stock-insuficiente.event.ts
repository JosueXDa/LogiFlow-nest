export class StockInsuficienteEvent {
  pedidoId: string;
  productoId: string;
  productoSku: string;
  stockDisponible: number;
  cantidadSolicitada: number;
  fecha: Date;
}
