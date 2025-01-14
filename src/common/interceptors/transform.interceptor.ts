import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T;
  statusCode: number;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map(data => {
        // إذا كان الdata فارغ، نرجع كائن فارغ
        if (!data) {
          return {
            statusCode,
            data: {},
            message: 'Success'
          };
        }

        // إذا كان الdata يحتوي على message، نستخدمه
        if (typeof data === 'object' && 'message' in data) {
          const { message, ...rest } = data;
          return {
            statusCode,
            data: rest,
            message
          };
        }

        // في الحالات الأخرى نرجع الdata كما هو
        return {
          statusCode,
          data,
          message: 'Success'
        };
      }),
    );
  }
} 