/**
 * Enums compartidos para documentación Swagger
 * Estos enums son copias de los microservicios, solo para documentación
 */

// ==========================================
// BILLING SERVICE ENUMS
// ==========================================
export enum TipoEntrega {
    URBANA = 'URBANA',
    INTERMUNICIPAL = 'INTERMUNICIPAL',
    NACIONAL = 'NACIONAL',
}

export enum TipoVehiculo {
    MOTORIZADO = 'MOTORIZADO',
    VEHICULO_LIVIANO = 'VEHICULO_LIVIANO',
    CAMION = 'CAMION',
}

export enum EstadoFactura {
    BORRADOR = 'BORRADOR',
    EMITIDA = 'EMITIDA',
    PAGADA = 'PAGADA',
    CANCELADA = 'CANCELADA',
    ANULADA = 'ANULADA',
}

export enum TipoPago {
    EFECTIVO = 'EFECTIVO',
    TARJETA = 'TARJETA',
    TRANSFERENCIA = 'TRANSFERENCIA',
    CREDITO = 'CREDITO',
}

// ==========================================
// FLEET SERVICE ENUMS
// ==========================================
export enum EstadoRepartidor {
    DISPONIBLE = 'DISPONIBLE',
    OCUPADO = 'OCUPADO',
    INACTIVO = 'INACTIVO',
    SUSPENDIDO = 'SUSPENDIDO',
}

export enum EstadoVehiculo {
    OPERATIVO = 'OPERATIVO',
    EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
    FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
}

export enum EstadoAsignacion {
    ASIGNADA = 'ASIGNADA',
    EN_CURSO = 'EN_CURSO',
    COMPLETADA = 'COMPLETADA',
    CANCELADA = 'CANCELADA',
}

export enum TipoLicencia {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
}

// ==========================================
// PEDIDOS SERVICE ENUMS
// ==========================================
export enum PedidoEstado {
    PENDIENTE = 'PENDIENTE',
    ASIGNADO = 'ASIGNADO',
    EN_RUTA = 'EN_RUTA',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO',
}

export enum TipoVehiculoPedido {
    MOTO = 'MOTO',
    LIVIANO = 'LIVIANO',
    CAMION = 'CAMION',
}
