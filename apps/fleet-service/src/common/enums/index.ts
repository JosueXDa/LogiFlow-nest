export enum EstadoRepartidor {
    DISPONIBLE = 'DISPONIBLE',
    OCUPADO = 'OCUPADO',
    INACTIVO = 'INACTIVO',
    SUSPENDIDO = 'SUSPENDIDO',
}

export enum TipoVehiculo {
    MOTORIZADO = 'MOTORIZADO',
    VEHICULO_LIVIANO = 'VEHICULO_LIVIANO',
    CAMION = 'CAMION',
}

export enum EstadoVehiculo {
    OPERATIVO = 'OPERATIVO',
    EN_MANTENIMIENTO = 'EN_MANTENIMIENTO',
    FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
}

export enum TipoEntrega {
    URBANA = 'URBANA',
    INTERMUNICIPAL = 'INTERMUNICIPAL',
    NACIONAL = 'NACIONAL',
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
