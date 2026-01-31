import { DataSource } from 'typeorm';
import { Tarifa, TipoEntrega, TipoVehiculo } from '../../modules/billing/entities/tarifa.entity';

export const seedTarifas = async (dataSource: DataSource) => {
    const tarifaRepository = dataSource.getRepository(Tarifa);

    const tarifas = [
        {
            tipoEntrega: TipoEntrega.URBANA,
            tipoVehiculo: TipoVehiculo.MOTORIZADO,
            nombre: 'Urbana Motorizado',
            descripcion: 'Entrega rápida en moto dentro de la ciudad',
            tarifaBase: 2.50,
            costoPorKm: 0.50,
            costoMinimo: 2.50,
            kmIncluidos: 3,
            tarifaUrgente: 1.50,
            activa: true,
        },
        {
            tipoEntrega: TipoEntrega.URBANA,
            tipoVehiculo: TipoVehiculo.VEHICULO_LIVIANO,
            nombre: 'Urbana Vehículo Liviano',
            descripcion: 'Entrega en auto/furgoneta dentro de la ciudad',
            tarifaBase: 5.00,
            costoPorKm: 0.80,
            costoMinimo: 5.00,
            kmIncluidos: 3,
            tarifaUrgente: 3.00,
            activa: true,
        },
        {
            tipoEntrega: TipoEntrega.INTERMUNICIPAL,
            tipoVehiculo: TipoVehiculo.CAMION,
            nombre: 'Intermunicipal Camión',
            descripcion: 'Transporte de carga entre ciudades cercanas',
            tarifaBase: 50.00,
            costoPorKm: 1.20,
            costoPorKg: 0.10,
            costoMinimo: 60.00,
            kmIncluidos: 0,
            kgIncluidos: 100,
            factorZona: 1.1,
            activa: true,
        },
        {
            tipoEntrega: TipoEntrega.NACIONAL,
            tipoVehiculo: TipoVehiculo.CAMION,
            nombre: 'Nacional Camión',
            descripcion: 'Transporte nacional de larga distancia',
            tarifaBase: 100.00,
            costoPorKm: 1.00,
            costoPorKg: 0.15,
            costoMinimo: 120.00,
            porcentajeDescuentoVolumen: 5.0,
            activa: true,
        },
    ];

    for (const tarifaData of tarifas) {
        const exists = await tarifaRepository.findOne({
            where: {
                tipoEntrega: tarifaData.tipoEntrega,
                tipoVehiculo: tarifaData.tipoVehiculo,
            },
        });

        if (!exists) {
            await tarifaRepository.save(tarifaRepository.create(tarifaData));
            console.log(`Tarifa creada: ${tarifaData.nombre}`);
        } else {
            console.log(`Tarifa ya existe: ${tarifaData.nombre}`);
        }
    }
};
