import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    ('Before...');

    const now = Date.now();
    return next.handle().pipe(
      catchError((error) => {
        console.log('APP ERROR', error);
        throw error;
      }),
    );
  }
}
