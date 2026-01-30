import { CallHandler, ExecutionContext, Injectable, NestInterceptor, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const now = Date.now();
        const type = context.getType();
        const handler = context.getHandler().name;

        return next
            .handle()
            .pipe(
                tap(() => this.logger.log(`Handler: ${handler} [${type}] - Duration: ${Date.now() - now}ms`)),
            );
    }
}
