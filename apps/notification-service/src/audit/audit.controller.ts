import { Controller, Logger, OnModuleInit } from '@nestjs/common';
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
}
