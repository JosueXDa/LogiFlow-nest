import {
    Body,
    Controller,
    Get,
    Inject,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiParam, ApiQuery, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../decorators/roles.decorator';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';
import {
    CalcularTarifaDto,
    CreateFacturaDto,
    FiltrosFacturaDto,
    RegistrarPagoDto,
    CancelarFacturaDto,
    DailyReportQueryDto,
} from '../swagger/dto/billing.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('billing')
export class BillingController {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.BILLING_SERVICE)
        private readonly billingClient: ClientProxy,
    ) { }

    @Post('calculate-tariff')
    @UseGuards(AuthGuard)
    @Roles('CLIENTE')
    @ApiOperation({ summary: 'Calcular tarifa de envío', description: 'Calcula el costo de envío basado en tipo de entrega, vehículo, distancia y peso' })
    @ApiBody({ type: CalcularTarifaDto })
    @ApiResponse({ status: 200, description: 'Tarifa calculada exitosamente' })
    @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
    async calculateTariff(@Body() dto: CalcularTarifaDto) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.calcular_tarifa' }, dto),
        );
    }

    @Post('invoices')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Crear factura borrador', description: 'Crea una nueva factura en estado borrador' })
    @ApiBody({ type: CreateFacturaDto })
    @ApiResponse({ status: 201, description: 'Factura creada exitosamente' })
    async createInvoiceDraft(@Body() dto: CreateFacturaDto) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.crear_factura_borrador' }, dto),
        );
    }

    @Get('invoices')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Listar facturas', description: 'Obtiene lista paginada de facturas con filtros opcionales' })
    @ApiResponse({ status: 200, description: 'Lista de facturas' })
    async findAll(@Query() query: FiltrosFacturaDto) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.listar_facturas' }, query),
        );
    }

    @Get('invoices/:id')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Obtener factura por ID' })
    @ApiParam({ name: 'id', description: 'ID de la factura (UUID)' })
    @ApiResponse({ status: 200, description: 'Factura encontrada' })
    @ApiResponse({ status: 404, description: 'Factura no encontrada' })
    async findOne(@Param('id') id: string) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.obtener_factura' }, id),
        );
    }

    @Get('invoices/order/:pedidoId')
    @UseGuards(AuthGuard)
    @Roles('CLIENTE')
    @ApiOperation({ summary: 'Obtener factura por pedido', description: 'Busca la factura asociada a un pedido específico' })
    @ApiParam({ name: 'pedidoId', description: 'ID del pedido (UUID)' })
    @ApiResponse({ status: 200, description: 'Factura encontrada' })
    @ApiResponse({ status: 404, description: 'Factura no encontrada' })
    async findByOrder(@Param('pedidoId') pedidoId: string) {
        return firstValueFrom(
            this.billingClient.send(
                { cmd: 'billing.obtener_factura_por_pedido' },
                pedidoId,
            ),
        );
    }

    @Patch('invoices/:id/emit')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Emitir factura', description: 'Cambia el estado de la factura de BORRADOR a EMITIDA' })
    @ApiParam({ name: 'id', description: 'ID de la factura (UUID)' })
    @ApiResponse({ status: 200, description: 'Factura emitida exitosamente' })
    async emitInvoice(@Param('id') id: string) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.emitir_factura' }, id),
        );
    }

    @Post('invoices/:id/payment')
    @UseGuards(AuthGuard)
    @Roles('ADMIN', 'SISTEMA')
    @ApiOperation({ summary: 'Registrar pago', description: 'Registra el pago de una factura' })
    @ApiParam({ name: 'id', description: 'ID de la factura (UUID)' })
    @ApiBody({ type: RegistrarPagoDto })
    @ApiResponse({ status: 200, description: 'Pago registrado exitosamente' })
    async registerPayment(@Param('id') id: string, @Body() dto: RegistrarPagoDto) {
        return firstValueFrom(
            this.billingClient.send(
                { cmd: 'billing.registrar_pago' },
                { id, data: dto },
            ),
        );
    }

    @Patch('invoices/:id/cancel')
    @UseGuards(AuthGuard)
    @Roles('GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Anular factura', description: 'Anula una factura especificando el motivo' })
    @ApiParam({ name: 'id', description: 'ID de la factura (UUID)' })
    @ApiBody({ type: CancelarFacturaDto })
    @ApiResponse({ status: 200, description: 'Factura anulada exitosamente' })
    async cancelInvoice(
        @Param('id') id: string,
        @Body() body: CancelarFacturaDto,
    ) {
        return firstValueFrom(
            this.billingClient.send(
                { cmd: 'billing.anular_factura' },
                { id, motivo: body.motivo },
            ),
        );
    }

    @Get('daily-report')
    @UseGuards(AuthGuard)
    @Roles('SUPERVISOR', 'GERENTE', 'ADMIN')
    @ApiOperation({ summary: 'Obtener reporte diario', description: 'Genera reporte de facturación para una fecha específica' })
    @ApiQuery({ name: 'date', required: true, description: 'Fecha del reporte (YYYY-MM-DD)' })
    @ApiQuery({ name: 'zonaId', required: false, description: 'Filtrar por zona (UUID)' })
    @ApiResponse({ status: 200, description: 'Reporte generado' })
    async getDailyReport(@Query('date') date: string, @Query('zonaId') zonaId?: string) {
        return firstValueFrom(
            this.billingClient.send(
                { cmd: 'billing.reporte_diario' },
                { fecha: date, zonaId },
            ),
        );
    }
}
