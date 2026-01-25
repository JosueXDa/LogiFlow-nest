import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Filtro global de excepciones para microservicios
 * Convierte excepciones HTTP y de base de datos a formato RPC
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any).message || message;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Loguear el error para debugging
    console.error('Fleet Service Error:', {
      timestamp: new Date().toISOString(),
      data,
      exception:
        exception instanceof Error
          ? {
              message: exception.message,
              stack: exception.stack,
            }
          : exception,
    });

    // Lanzar excepción RPC que el API Gateway puede manejar
    throw new RpcException({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
