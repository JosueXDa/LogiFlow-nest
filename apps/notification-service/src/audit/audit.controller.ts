import { Controller, Logger, OnModuleInit, Get, Param, Query } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuditService } from './audit.service';

@Controller()
export class AuditController implements OnModuleInit {
    private readonly logger = new Logger(AuditController.name);

    constructor(private readonly auditService: AuditService) { }

    onModuleInit() {
        this.logger.log('🎧 AuditController initialized - Listening for events with pattern "#"');
    }

    @EventPattern('#') // Wildcard to listen to ALL events in the Topic Exchange
    async handleAllEvents(@Payload() data: any, @Ctx() context: RmqContext) {
        const originalMessage = context.getMessage();
        const routingKey = originalMessage.fields?.routingKey || 'unknown';
        const channel = context.getChannelRef();

        this.logger.log(`📥 ======== EVENT RECEIVED ========`);
        this.logger.log(`📥 Routing Key: ${routingKey}`);
        this.logger.log(`📥 Data: ${JSON.stringify(data)}`);

        // Avoid logging internal notification events to prevent loops
        if (routingKey.startsWith('notification.')) {
            this.logger.log(`⏭️ Skipping internal notification event`);
            channel.ack(originalMessage);
            return;
        }

        try {
            await this.auditService.logEvent(routingKey, data);
            channel.ack(originalMessage);
            this.logger.log(`✅ Event '${routingKey}' processed and acked`);
        } catch (error) {
            this.logger.error(`❌ Failed to process event '${routingKey}':`, error.message);
            channel.nack(originalMessage, false, false);
        }
    }

    // ============ HTTP REST ENDPOINTS ============

    /**
     * GET /notifications
     * Lista todas las notificaciones guardadas (últimas 100)
     */
    @Get('notifications')
    async getAllNotifications(@Query('limit') limit?: number) {
        this.logger.log(`🔍 GET /notifications - Limit: ${limit || 100}`);
        return this.auditService.getAllLogs(limit || 100);
    }

    /**
     * GET /notifications/:id
     * Obtiene una notificación específica por ID
     */
    @Get('notifications/:id')
    async getNotificationById(@Param('id') id: string) {
        this.logger.log(`🔍 GET /notifications/${id}`);
        return this.auditService.getLogById(id);
    }

    /**
     * GET /notifications/event/:eventName
     * Filtra notificaciones por nombre de evento
     */
    @Get('notifications/event/:eventName')
    async getNotificationsByEvent(
        @Param('eventName') eventName: string,
        @Query('limit') limit?: number
    ) {
        this.logger.log(`🔍 GET /notifications/event/${eventName}`);
        return this.auditService.getLogsByEvent(eventName, limit || 50);
    }

    /**
     * GET /notifications/stats
     * Estadísticas de notificaciones
     */
    @Get('notifications/stats')
    async getNotificationStats() {
        this.logger.log(`📊 GET /notifications/stats`);
        return this.auditService.getStats();
    }
}
