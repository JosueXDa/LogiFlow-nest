export class PedidoCanceladoEvent {
  pedidoId: string;
  razon: string;
  items: Array<{
    itemId: string;
    productoId: string;
    reservaId?: string;
  }>;
  fecha: Date;
}
