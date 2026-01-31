import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BillingService } from '../services/billing.service';
import { TariffCalculatorService } from '../services/tariff-calculator.service';
import { CreateFacturaDto } from '../dto/create-factura.dto';
import { UpdateFacturaDto } from '../dto/update-factura.dto';
import { CalcularTarifaDto } from '../dto/calcular-tarifa.dto';
import { FiltrosFacturaDto } from '../dto/filtros-factura.dto';

/**
 * Controlador TCP para comunicación con API Gateway
 * No requiere autenticación (manejada en API Gateway)
 */
@Controller()
export class BillingController {
    private readonly logger = new Logger(BillingController.name);

    constructor(
        private readonly billingService: BillingService,
        private readonly tariffCalculator: TariffCalculatorService,
    ) { }

    /**
     * Calcular tarifa sin crear factura
     */
    @MessagePattern({ cmd: 'billing.calcular_tarifa' })
    async calcularTarifa(@Payload() dto: CalcularTarifaDto) {
        try {
            this.logger.log(`Calculando tarifa: ${JSON.stringify(dto)}`);
            const resultado = await this.tariffCalculator.calcularTarifa(dto);
            return { success: true, data: resultado };
        } catch (error) {
            this.logger.error(`Error calculando tarifa: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }

    /**
     * Crear factura en estado BORRADOR
     */
    @MessagePattern({ cmd: 'billing.crear_factura_borrador' })
    async crearFacturaBorrador(@Payload() dto: CreateFacturaDto) {
        try {
            this.logger.log(`Creando factura borrador para pedido: ${dto.pedidoId}`);
            const factura = await this.billingService.createFacturaBorrador(dto);
            return { success: true, data: factura };
        } catch (error) {
            this.logger.error(`Error creando factura: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener factura por ID
     */
    @MessagePattern({ cmd: 'billing.obtener_factura' })
    async obtenerFactura(@Payload() id: string) {
        try {
            this.logger.log(`Obteniendo factura: ${id}`);
            const factura = await this.billingService.findById(id);
            return { success: true, data: factura };
        } catch (error) {
            this.logger.error(`Error obteniendo factura: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener factura por ID de pedido
     */
    @MessagePattern({ cmd: 'billing.obtener_factura_por_pedido' })
    async obtenerFacturaPorPedido(@Payload() pedidoId: string) {
        try {
            this.logger.log(`Obteniendo factura para pedido: ${pedidoId}`);
            const factura = await this.billingService.findByPedidoId(pedidoId);
            return { success: true, data: factura };
        } catch (error) {
            this.logger.error(
                `Error obteniendo factura por pedido: ${error.message}`,
                error.stack,
            );
            return { success: false, error: error.message };
        }
    }

    /**
     * Listar facturas con filtros
     */
    @MessagePattern({ cmd: 'billing.listar_facturas' })
    async listarFacturas(@Payload() filtros: FiltrosFacturaDto) {
        try {
            this.logger.log(`Listando facturas con filtros: ${JSON.stringify(filtros)}`);
            const resultado = await this.billingService.findAll(filtros);
            return { success: true, data: resultado };
        } catch (error) {
            this.logger.error(`Error listando facturas: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }

    /**
     * Emitir factura (cambiar a estado EMITIDA)
     */
    @MessagePattern({ cmd: 'billing.emitir_factura' })
    async emitirFactura(@Payload() id: string) {
        try {
            this.logger.log(`Emitiendo factura: ${id}`);
            const factura = await this.billingService.emitirFactura(id);
            return { success: true, data: factura };
        } catch (error) {
            this.logger.error(`Error emitiendo factura: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }

    /**
     * Registrar pago de factura
     */
    @MessagePattern({ cmd: 'billing.registrar_pago' })
    async registrarPago(
        @Payload() payload: { id: string; data: UpdateFacturaDto },
    ) {
        try {
            this.logger.log(`Registrando pago de factura: ${payload.id}`);
            const factura = await this.billingService.registrarPago(
                payload.id,
                payload.data,
            );
            return { success: true, data: factura };
        } catch (error) {
            this.logger.error(`Error registrando pago: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }

    /**
     * Anular factura
     */
    @MessagePattern({ cmd: 'billing.anular_factura' })
    async anularFactura(@Payload() payload: { id: string; motivo: string }) {
        try {
            this.logger.log(`Anulando factura: ${payload.id}`);
            const factura = await this.billingService.anularFactura(
                payload.id,
                payload.motivo,
            );
            return { success: true, data: factura };
        } catch (error) {
            this.logger.error(`Error anulando factura: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener reporte diario
     */
    @MessagePattern({ cmd: 'billing.reporte_diario' })
    async reporteDiario(@Payload() payload: { fecha: string; zonaId?: string }) {
        try {
            this.logger.log(`Generando reporte diario: ${payload.fecha}`);
            const reporte = await this.billingService.getReporteDiario(
                new Date(payload.fecha),
                payload.zonaId,
            );
            return { success: true, data: reporte };
        } catch (error) {
            this.logger.error(
                `Error generando reporte: ${error.message}`,
                error.stack,
            );
            return { success: false, error: error.message };
        }
    }
}
