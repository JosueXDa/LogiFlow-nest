import { Controller, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @EventPattern('pedido.creado')
  handlePedidoCreado(@Payload() data: any, @Ctx() context: RmqContext) {
    this.logger.log(`Evento recibido: pedido.creado`, data);
    this.appService.sendNotification(data);
    
    // Acknowledgement manual si fuera necesario (depende de la config)
    // const channel = context.getChannelRef();
    // const originalMsg = context.getMessage();
    // channel.ack(originalMsg);
  }

  @EventPattern('pedido.estado.actualizado')
  handlePedidoActualizado(@Payload() data: any) {
    this.logger.log(`Evento recibido: pedido.estado.actualizado`, data);
    this.appService.sendNotification(data);
  }
}
