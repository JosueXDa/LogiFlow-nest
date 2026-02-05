import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class VehiculoType {
    @Field()
    tipo: string;
}

@ObjectType()
export class RepartidorType {
    @Field()
    nombre: string;

    @Field(() => VehiculoType)
    vehiculo: VehiculoType;
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
