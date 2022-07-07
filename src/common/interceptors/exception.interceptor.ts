import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { catchError, Observable } from "rxjs";

export class EntityNotFoundError extends Error {}

export class UnauthorizedError extends Error {}

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // next.handle() is an Observable of the controller's result value
    return next.handle()
      .pipe(catchError(error => {
        if (error instanceof EntityNotFoundError) {
          throw new NotFoundException(error.message);
        } else if(error instanceof UnauthorizedError) {
          throw new UnauthorizedException(error.message)
        } else {
          throw error;
        }
      }));
  }
}