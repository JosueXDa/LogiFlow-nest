import { EstadoFactura } from '../../billing/entities/factura.entity';

export class FacturaGeneradaEvent {
    facturaId: string;
    pedidoId: string;
    numeroFactura: string;
    total: number;
    estado: EstadoFactura;
    clienteId: string;
}

export class FacturaEmitidaEvent {
    facturaId: string;
    pedidoId: string;
    numeroFactura: string;
    total: number;
    clienteId: string;
}

export class FacturaPagadaEvent {
    facturaId: string;
    pedidoId: string;
    numeroFactura: string;
    total: number;
    tipoPago: string;
    referenciaPago?: string;
    fechaPago: Date;
}

export class FacturaAnuladaEvent {
    facturaId: string;
    pedidoId: string;
    numeroFactura: string;
    motivo: string;
}
