import { Observable } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import { ArgumentsHost, Catch, RpcExceptionFilter } from '@nestjs/common';

@Catch(RpcException)
export class RpcExceptionFilterImplementation implements RpcExceptionFilter<RpcException> {
    catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
        return new Observable(observer => {
            observer.error(exception.getError());
        });
    }
}
