import { IsIn, IsOptional, IsString } from 'class-validator';
import { PedidoEstado } from '../entities';

export class UpdateEstadoDto {
  @IsIn([PedidoEstado.EN_RUTA, PedidoEstado.ENTREGADO])
  nuevoEstado: PedidoEstado.EN_RUTA | PedidoEstado.ENTREGADO;

  @IsOptional()
  @IsString()
  evidenciaEntrega?: string;
}
