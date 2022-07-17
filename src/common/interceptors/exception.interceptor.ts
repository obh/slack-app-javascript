import { CallHandler, ExecutionContext, Injectable, NestInterceptor, NotFoundException, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { catchError, Observable, of, throwError } from "rxjs";

export class EntityNotFoundError extends Error {}

export class UnauthorizedError extends Error {}

export class CommandNotFoundError extends Error {}

// we don't want to throw errors to the Slack app. So we will wrap them up
export class SlackError extends Error{}

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): any {
    // next.handle() is an Observable of the controller's result value
    return next.handle()
      .pipe(catchError(error => {
        console.log("error is here --> ", error)
        if(error instanceof SlackError){
          return of(error.message)
        } else {
          throwError(() => new Error(error))
        }
      }
    ));
  }
}