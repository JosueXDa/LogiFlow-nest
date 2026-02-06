import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('notification_logs')
export class NotificationLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    eventName: string;

    @Column({ type: 'jsonb', nullable: true })
    payload: any;

    @Column({ nullable: true })
    source: string;

    @CreateDateColumn()
    createdAt: Date;
}
