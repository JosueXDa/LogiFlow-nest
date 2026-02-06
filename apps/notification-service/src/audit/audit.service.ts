import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../common/entities/notification-log.entity';

@Injectable()
export class AuditService implements OnModuleInit {
    private readonly logger = new Logger(AuditService.name);

    constructor(
        @InjectRepository(NotificationLog)
        private readonly logRepository: Repository<NotificationLog>,
    ) { }

    onModuleInit() {
        this.logger.log('🔊 AuditService initialized - Ready to log events');
    }

    async logEvent(eventName: string, payload: any) {
        this.logger.log(`📝 ======== LOGGING EVENT ========`);
        this.logger.log(`📝 Event Name: ${eventName}`);
        this.logger.log(`📝 Payload: ${JSON.stringify(payload, null, 2)}`);

        try {
            const log = this.logRepository.create({
                eventName,
                payload,
                source: 'RabbitMQ',
            });
            const saved = await this.logRepository.save(log);
            this.logger.log(`✅ Event saved to DB with ID: ${saved.id}`);
            return saved;
        } catch (error) {
            this.logger.error(`❌ Failed to save event to DB:`, error.message);
            throw error;
        }
    }

    async getAllLogs(limit: number = 50): Promise<NotificationLog[]> {
        return this.logRepository.find({ 
            order: { createdAt: 'DESC' }, 
            take: limit 
        });
    }

    async getLogById(id: string): Promise<NotificationLog | null> {
        return this.logRepository.findOne({ where: { id } });
    }

    async getLogsByEvent(eventName: string, limit: number = 50): Promise<NotificationLog[]> {
        return this.logRepository.find({
            where: { eventName },
            order: { createdAt: 'DESC' },
            take: limit
        });
    }

    async getStats() {
        const total = await this.logRepository.count();
        
        const eventCounts = await this.logRepository
            .createQueryBuilder('log')
            .select('log.eventName', 'eventName')
            .addSelect('COUNT(*)', 'count')
            .groupBy('log.eventName')
            .orderBy('count', 'DESC')
            .getRawMany();

        const last24h = await this.logRepository
            .createQueryBuilder('log')
            .where('log.createdAt > NOW() - INTERVAL \'24 hours\'')
            .getCount();

        return {
            total,
            last24h,
            byEvent: eventCounts,
        };
    }
}
