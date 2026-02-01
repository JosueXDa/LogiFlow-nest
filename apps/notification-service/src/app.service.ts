import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject('EVENTS_SERVICE') private readonly client: ClientProxy) {}

  sendNotification(data: any) {
    // Aquí implement la lógica para enviar email, SMS, push notification, etc.
    this.logger.log('Procesando notificación para:', data);
    
    // Ejemplo: Emitir evento de auditoría
    this.client.emit('audit.notification.sent', {
      originalData: data,
      timestamp: new Date(),
    });

    return { status: 'Notificación enviada' };
  }
}
