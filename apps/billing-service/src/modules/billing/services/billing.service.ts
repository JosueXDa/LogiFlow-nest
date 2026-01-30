import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Factura, EstadoFactura, TipoPago } from '../entities/factura.entity';
import { TariffCalculatorService } from './tariff-calculator.service';
import { InvoiceGeneratorService } from './invoice-generator.service';
import { CreateFacturaDto } from '../dto/create-factura.dto';
import { UpdateFacturaDto } from '../dto/update-factura.dto';
import { FiltrosFacturaDto } from '../dto/filtros-factura.dto';

@Injectable()
export class BillingService {
    constructor(
        @InjectRepository(Factura)
        private readonly facturaRepository: Repository<Factura>,
        private readonly tariffCalculator: TariffCalculatorService,
        private readonly invoiceGenerator: InvoiceGeneratorService,
    ) { }

    /**
     * Crear factura en estado BORRADOR
     * Transacción ACID local
     */
    async createFacturaBorrador(createDto: CreateFacturaDto): Promise<Factura> {
        // Validar que no exista factura para este pedido
        const facturaExistente = await this.facturaRepository.findOne({
            where: { pedidoId: createDto.pedidoId },
        });

        if (facturaExistente) {
            throw new BadRequestException(
                `Ya existe una factura para el pedido ${createDto.pedidoId}`,
            );
        }

        // Calcular tarifa utilizando el servicio especializado
        const calculoTarifa = await this.tariffCalculator.calcularTarifa({
            tipoEntrega: createDto.tipoEntrega,
            tipoVehiculo: createDto.tipoVehiculo,
            distanciaKm: createDto.distanciaKm,
            pesoKg: createDto.pesoKg,
            esUrgente: createDto.esUrgente,
            zonaId: createDto.zonaId,
        });

        // Generar número de factura único
        const numeroFactura = await this.generarNumeroFactura();

        // Crear entidad de factura
        const factura = this.facturaRepository.create({
            numeroFactura,
            pedidoId: createDto.pedidoId,
            clienteId: createDto.clienteId,
            clienteNombre: createDto.clienteNombre,
            clienteRuc: createDto.clienteRuc,
            clienteDireccion: createDto.clienteDireccion,
            zonaId: createDto.zonaId,
            zonaNombre: createDto.zonaNombre,
            estado: EstadoFactura.BORRADOR,
            subtotal: calculoTarifa.subtotal,
            descuento: calculoTarifa.descuento,
            iva: calculoTarifa.iva,
            porcentajeIva: 12.0,
            total: calculoTarifa.total,
            detalles: calculoTarifa.detalles,
            metadata: calculoTarifa.breakdown,
        });

        // Guardar con transacción ACID
        return await this.facturaRepository.save(factura);
    }

    /**
     * Obtener factura por ID
     */
    async findById(id: string): Promise<Factura> {
        const factura = await this.facturaRepository.findOne({
            where: { id },
            relations: ['detalles'],
        });

        if (!factura) {
            throw new NotFoundException(`Factura con ID ${id} no encontrada`);
        }

        return factura;
    }

    /**
     * Obtener factura por ID de pedido
     */
    async findByPedidoId(pedidoId: string): Promise<Factura> {
        const factura = await this.facturaRepository.findOne({
            where: { pedidoId },
            relations: ['detalles'],
        });

        if (!factura) {
            throw new NotFoundException(
                `Factura para pedido ${pedidoId} no encontrada`,
            );
        }

        return factura;
    }

    /**
     * Listar facturas con filtros y paginación
     */
    async findAll(filtros: FiltrosFacturaDto) {
        const { page = 1, limit = 10, ...where } = filtros;
        const skip = (page - 1) * limit;

        // Construir query dinámico
        const queryBuilder = this.facturaRepository
            .createQueryBuilder('factura')
            .leftJoinAndSelect('factura.detalles', 'detalles')
            .orderBy('factura.createdAt', 'DESC');

        if (where.estado) {
            queryBuilder.andWhere('factura.estado = :estado', { estado: where.estado });
        }

        if (where.clienteId) {
            queryBuilder.andWhere('factura.clienteId = :clienteId', {
                clienteId: where.clienteId,
            });
        }

        if (where.zonaId) {
            queryBuilder.andWhere('factura.zonaId = :zonaId', { zonaId: where.zonaId });
        }

        if (where.fechaDesde && where.fechaHasta) {
            queryBuilder.andWhere('factura.createdAt BETWEEN :fechaDesde AND :fechaHasta', {
                fechaDesde: where.fechaDesde,
                fechaHasta: where.fechaHasta,
            });
        }

        const [facturas, total] = await queryBuilder
            .skip(skip)
            .take(limit)
            .getManyAndCount();

        return {
            data: facturas,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Emitir factura (cambiar de BORRADOR a EMITIDA)
     * Transacción ACID
     */
    async emitirFactura(id: string): Promise<Factura> {
        const factura = await this.findById(id);

        if (factura.estado !== EstadoFactura.BORRADOR) {
            throw new BadRequestException(
                'Solo se pueden emitir facturas en estado BORRADOR',
            );
        }

        factura.estado = EstadoFactura.EMITIDA;
        return await this.facturaRepository.save(factura);
    }

    /**
     * Registrar pago de factura
     * Transacción ACID
     */
    async registrarPago(
        id: string,
        updateDto: UpdateFacturaDto,
    ): Promise<Factura> {
        const factura = await this.findById(id);

        if (factura.estado !== EstadoFactura.EMITIDA) {
            throw new BadRequestException('Solo se pueden pagar facturas emitidas');
        }

        factura.estado = EstadoFactura.PAGADA;
        if (updateDto.tipoPago) factura.tipoPago = updateDto.tipoPago;
        factura.fechaPago = new Date();
        if (updateDto.referenciaPago) factura.referenciaPago = updateDto.referenciaPago;
        if (updateDto.observaciones) factura.observaciones = updateDto.observaciones;

        return await this.facturaRepository.save(factura);
    }

    /**
     * Anular factura
     * Transacción ACID
     */
    async anularFactura(id: string, motivo: string): Promise<Factura> {
        const factura = await this.findById(id);

        if (factura.estado === EstadoFactura.PAGADA) {
            throw new BadRequestException('No se puede anular una factura pagada');
        }

        factura.estado = EstadoFactura.ANULADA;
        factura.observaciones = `ANULADA: ${motivo}`;

        return await this.facturaRepository.save(factura);
    }

    /**
     * Obtener reporte diario de facturación
     */
    async getReporteDiario(fecha: Date, zonaId?: string) {
        const inicioDia = new Date(fecha);
        inicioDia.setHours(0, 0, 0, 0);

        const finDia = new Date(fecha);
        finDia.setHours(23, 59, 59, 999);

        const query = this.facturaRepository
            .createQueryBuilder('factura')
            .where('factura.createdAt BETWEEN :inicio AND :fin', {
                inicio: inicioDia,
                fin: finDia,
            });

        if (zonaId) {
            query.andWhere('factura.zonaId = :zonaId', { zonaId });
        }

        const facturas = await query.getMany();

        // Calcular estadísticas
        const totalFacturado = facturas.reduce(
            (sum, f) => sum + Number(f.total),
            0,
        );

        const totalPagado = facturas
            .filter((f) => f.estado === EstadoFactura.PAGADA)
            .reduce((sum, f) => sum + Number(f.total), 0);

        const totalPendiente = facturas
            .filter((f) => f.estado === EstadoFactura.EMITIDA)
            .reduce((sum, f) => sum + Number(f.total), 0);

        return {
            fecha,
            zonaId,
            resumen: {
                cantidadTotal: facturas.length,
                cantidadBorrador: facturas.filter((f) => f.estado === EstadoFactura.BORRADOR).length,
                cantidadEmitida: facturas.filter((f) => f.estado === EstadoFactura.EMITIDA).length,
                cantidadPagada: facturas.filter((f) => f.estado === EstadoFactura.PAGADA).length,
                cantidadAnulada: facturas.filter((f) => f.estado === EstadoFactura.ANULADA).length,
                totalFacturado,
                totalPagado,
                totalPendiente,
                pendienteCobro: totalFacturado - totalPagado,
            },
            facturas,
        };
    }

    /**
     * Generar número de factura único
     * Formato: F-YYYYMM-XXXXXX
     */
    private async generarNumeroFactura(): Promise<string> {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const prefijo = `F-${año}${mes}`;

        // Obtener última factura del mes
        const ultimaFactura = await this.facturaRepository
            .createQueryBuilder('factura')
            .where('factura.numeroFactura LIKE :prefijo', { prefijo: `${prefijo}-%` })
            .orderBy('factura.numeroFactura', 'DESC')
            .getOne();

        let secuencial = 1;
        if (ultimaFactura) {
            const ultimoNumero = ultimaFactura.numeroFactura.split('-')[2];
            secuencial = parseInt(ultimoNumero, 10) + 1;
        }

        return `${prefijo}-${String(secuencial).padStart(6, '0')}`;
    }
}
