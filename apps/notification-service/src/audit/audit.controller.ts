import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { AuditService } from './audit.service';

@Controller()
export class AuditController {
    constructor(private readonly auditService: AuditService) { }

    @EventPattern('#') // Wildcard to listen to ALL events in the Topic Exchange
    async handleAllEvents(@Payload() data: any, @Ctx() context: RmqContext) {
        const originalMessage = context.getMessage();
        const routingKey = originalMessage.fields.routingKey;

        // Avoid logging internal notification events to prevent loops if we emit any
        if (routingKey.startsWith('notification.')) return;

        await this.auditService.logEvent(routingKey, data);
    }
}
