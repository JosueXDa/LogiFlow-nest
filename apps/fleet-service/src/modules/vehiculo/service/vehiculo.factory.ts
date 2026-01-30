import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { TipoVehiculo } from '../../../common/enums';
import { VehiculoEntrega } from '../entities/vehiculo-entrega.entity';
import { Motorizado } from '../entities/motorizado.entity';
import { VehiculoLiviano } from '../entities/vehiculo-liviano.entity';
import { Camion } from '../entities/camion.entity';
import { CreateVehiculoDto } from '../dto/vehiculo.dto';

@Injectable()
export class VehiculoFactory {
    create(tipo: TipoVehiculo, datos: CreateVehiculoDto): VehiculoEntrega {
        const baseDatos = {
            placa: datos.placa,
            marca: datos.marca,
            modelo: datos.modelo,
            año: datos.año,
            color: datos.color,
            capacidadKg: datos.capacidadKg,
            capacidadM3: datos.capacidadM3,
            tipo: datos.tipo
        };

        switch (tipo) {
            case TipoVehiculo.MOTORIZADO:
                const motorizado = new Motorizado();
                Object.assign(motorizado, baseDatos, {
                    cilindradaCc: datos.cilindradaCc,
                    tieneTopCase: datos.tieneTopCase
                });
                return motorizado;

            case TipoVehiculo.VEHICULO_LIVIANO:
                const liviano = new VehiculoLiviano();
                Object.assign(liviano, baseDatos, {
                    numeroPuertas: datos.numeroPuertas,
                    esPickup: datos.esPickup
                });
                return liviano;

            case TipoVehiculo.CAMION:
                const camion = new Camion();
                Object.assign(camion, baseDatos, {
                    tipoCamion: datos.tipoCamion,
                    numeroEjes: datos.numeroEjes
                });
                return camion;

            default:
                throw new RpcException('Tipo de vehículo no soportado');
        }
    }
}
