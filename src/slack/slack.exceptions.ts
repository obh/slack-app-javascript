import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { SlackError, UnauthorizedError } from 'src/common/interceptors/exception.interceptor';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.log("catchException::", exception)
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    if(exception instanceof UnauthorizedError){
      status = HttpStatus.UNAUTHORIZED;
    } else if(exception instanceof SlackError){
      status = HttpStatus.BAD_REQUEST;
    }        
    
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}