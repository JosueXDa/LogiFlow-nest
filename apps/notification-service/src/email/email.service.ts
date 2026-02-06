import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly mailjetApiKey: string;
    private readonly mailjetApiSecret: string;
    private readonly senderEmail: string;
    private readonly senderName: string;

    constructor(private readonly configService: ConfigService) {
        this.mailjetApiKey = this.configService.get<string>('MAILJET_API_KEY')!;
        this.mailjetApiSecret = this.configService.get<string>('MAILJET_API_SECRET')!;
        this.senderEmail = this.configService.get<string>('MAILJET_SENDER_EMAIL')!;
        this.senderName = this.configService.get<string>('MAILJET_SENDER_NAME')!;
    }

    async sendEmail(to: string, subject: string, htmlContent: string, textContent?: string) {
        const auth = Buffer.from(`${this.mailjetApiKey}:${this.mailjetApiSecret}`).toString('base64');

        try {
            this.logger.log(`📧 Sending email to ${to} using Mailjet`);

            const response = await axios.post(
                'https://api.mailjet.com/v3.1/send',
                {
                    Messages: [
                        {
                            From: {
                                Email: this.senderEmail,
                                Name: this.senderName,
                            },
                            To: [
                                {
                                    Email: to,
                                    Name: 'User',
                                },
                            ],
                            Subject: subject,
                            TextPart: textContent || 'Notification from LogiFlow',
                            HTMLPart: htmlContent,
                        },
                    ],
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${auth}`,
                    },
                },
            );

            this.logger.log(`✅ Email sent successfully: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            this.logger.error(`❌ Error sending email: ${error.message}`, error.response?.data);
            throw error;
        }
    }
}
