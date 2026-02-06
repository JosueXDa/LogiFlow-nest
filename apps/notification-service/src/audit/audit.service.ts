import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../common/entities/notification-log.entity';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @InjectRepository(NotificationLog)
        private readonly logRepository: Repository<NotificationLog>,
    ) { }

    async logEvent(eventName: string, payload: any) {
        this.logger.log(`📝 Auditing event: ${eventName}`);
        const log = this.logRepository.create({
            eventName,
            payload,
            source: 'RabbitMQ', // In a real scenario, this might come from metadata
        });
        await this.logRepository.save(log);
    }
}
