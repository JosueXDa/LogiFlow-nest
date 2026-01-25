export class StockReservadoEvent {
  reservaId: string;
  pedidoId: string;
  productoId: string;
  productoSku: string;
  cantidad: number;
  stockDisponible: number;
  fecha: Date;
}
