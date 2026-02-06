import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

// ====== ZONA ======
@ObjectType()
export class ZonaType {
    @Field(() => ID)
    id: string;

    @Field()
    nombre: string;

    @Field({ nullable: true })
    descripcion?: string;

    @Field({ nullable: true })
    coordenadas?: string;

    @Field(() => Int, { nullable: true })
    totalRepartidores?: number;
}

// ====== VEHICULO ======
@ObjectType()
export class VehiculoType {
    @Field(() => ID)
    id: string;

    @Field()
    tipo: string;

    @Field()
    placa: string;

    @Field()
    marca: string;

    @Field()
    modelo: string;

    @Field(() => Int, { name: 'anio' })
    año: number;

    @Field()
    color: string;

    @Field()
    estado: string;

    @Field(() => Float)
    capacidadKg: number;

    @Field(() => Float)
    capacidadM3: number;

    @Field(() => Int)
    kilometraje: number;

    @Field(() => Float, { nullable: true })
    cargaActualKg?: number;

    @Field(() => Float, { nullable: true })
    volumenActualM3?: number;
}

// ====== REPARTIDOR ======
@ObjectType()
export class RepartidorType {
    @Field(() => ID)
    id: string;

    @Field()
    nombre: string;

    @Field()
    apellido: string;

    @Field()
    cedula: string;

    @Field()
    telefono: string;

    @Field()
    email: string;

    @Field()
    licencia: string;

    @Field()
    tipoLicencia: string;

    @Field()
    estado: string;

    @Field(() => VehiculoType, { nullable: true })
    vehiculo?: VehiculoType;

    @Field(() => ZonaType, { nullable: true })
    zona?: ZonaType;
}

@ObjectType()
export class ClienteType {
    @Field()
    nombre: string;
}

@ObjectType()
export class FacturaType {
    @Field(() => Float)
    total: number;

    @Field()
    estado: string;
}

@ObjectType()
export class HistorialEstadoType {
    @Field()
    estado: string;

    @Field()
    fecha: string;
}

@ObjectType()
export class PedidoType {
    @Field(() => ID)
    id: string;

    @Field(() => ClienteType)
    cliente: ClienteType;

    @Field()
    destino: string;

    @Field()
    estado: string;

    @Field(() => RepartidorType, { nullable: true })
    repartidor?: RepartidorType;

    @Field({ nullable: true })
    tiempoTranscurrido?: string;

    @Field(() => Int, { nullable: true })
    retrasoMin?: number;

    @Field(() => [HistorialEstadoType], { nullable: true })
    historialEstados?: HistorialEstadoType[];

    @Field(() => FacturaType, { nullable: true })
    factura?: FacturaType;
}

@ObjectType()
export class FlotaActivaType {
    @Field(() => Int)
    total: number;

    @Field(() => Int)
    disponibles: number;

    @Field(() => Int)
    enRuta: number;
}

@ObjectType()
export class KpiDiarioType {
    @Field(() => Int)
    totalPedidos: number;

    @Field(() => Float)
    costoPromedioEntrega: number;

    @Field(() => Float)
    tasaCumplimiento: number;

    @Field(() => Float)
    ingresosTotales: number;
}
