import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from '../common/entities/notification-log.entity';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
    imports: [TypeOrmModule.forFeature([NotificationLog])],
    controllers: [AuditController],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule { }
