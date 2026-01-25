export class PedidoEntregadoEvent {
  pedidoId: string;
  items: Array<{
    itemId: string;
    productoId: string;
    reservaId?: string;
  }>;
  fecha: Date;
}
