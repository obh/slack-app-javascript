import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor} from "@nestjs/common";
import { catchError, Observable, of, throwError } from "rxjs";

export class EntityNotFoundError extends Error {}

export class UnauthorizedError extends Error {}

export class CommandNotFoundError extends Error {}

// we don't want to throw errors to the Slack app. So we will wrap them up
export class SlackError extends Error{}

@Injectable()
export class ErrorInterceptor implements NestInterceptor {

  private readonly logger = new Logger(ErrorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): any {
    

    return next.handle()
      .pipe(catchError(error => {
        this.logger.log("ErrorInterceptor::", error)
        if(error instanceof SlackError){
          return of(error.message)
        } else if (error instanceof UnauthorizedError){
          return of(error.message)
        } else {
          throwError(() => new Error(error))
        }
      }
    ));
  }
}