export class PedidoCreadoEvent {
  pedidoId: string;
  clienteId: string;
  items: Array<{
    itemId: string;
    productoId: string;
    productoSku: string;
    descripcion: string;
    cantidad: number;
    reservaId?: string;
  }>;
  fecha: Date;
}
