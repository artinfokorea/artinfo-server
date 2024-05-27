import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CommonResponse<T> {
  code: string;
  message: string | null;
  item: T | null;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, CommonResponse<T>> {
  intercept(_: ExecutionContext, next: CallHandler<T>): Observable<CommonResponse<T>> {
    return next.handle().pipe(
      map(item => {
        const code = 'OK';
        const message = null;

        return {
          code,
          message,
          item: item ?? null,
        };
      }),
    );
  }
}
