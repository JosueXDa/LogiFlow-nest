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
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES_CLIENTS } from '../constans';
import { AuthGuard } from '../guards/auth.guard';

@Controller('billing')
export class BillingController {
    constructor(
        @Inject(MICROSERVICES_CLIENTS.BILLING_SERVICE)
        private readonly billingClient: ClientProxy,
    ) { }

    @Post('calculate-tariff')
    @UseGuards(AuthGuard)
    async calculateTariff(@Body() dto: any) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.calcular_tarifa' }, dto),
        );
    }

    @Post('invoices')
    @UseGuards(AuthGuard)
    async createInvoiceDraft(@Body() dto: any) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.crear_factura_borrador' }, dto),
        );
    }

    @Get('invoices')
    @UseGuards(AuthGuard)
    async findAll(@Query() query: any) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.listar_facturas' }, query),
        );
    }

    @Get('invoices/:id')
    @UseGuards(AuthGuard)
    async findOne(@Param('id') id: string) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.obtener_factura' }, id),
        );
    }

    @Get('invoices/order/:pedidoId')
    @UseGuards(AuthGuard)
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
    async emitInvoice(@Param('id') id: string) {
        return firstValueFrom(
            this.billingClient.send({ cmd: 'billing.emitir_factura' }, id),
        );
    }

    @Post('invoices/:id/payment')
    @UseGuards(AuthGuard)
    async registerPayment(@Param('id') id: string, @Body() dto: any) {
        return firstValueFrom(
            this.billingClient.send(
                { cmd: 'billing.registrar_pago' },
                { id, data: dto },
            ),
        );
    }

    @Patch('invoices/:id/cancel')
    @UseGuards(AuthGuard)
    async cancelInvoice(
        @Param('id') id: string,
        @Body() body: { motivo: string },
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
    async getDailyReport(@Query('date') date: string, @Query('zonaId') zonaId?: string) {
        return firstValueFrom(
            this.billingClient.send(
                { cmd: 'billing.reporte_diario' },
                { fecha: date, zonaId },
            ),
        );
    }
}
