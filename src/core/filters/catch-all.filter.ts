import { Catch, ArgumentsHost, HttpException, InternalServerErrorException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class CatchAllFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      super.catch(exception, host);

      return;
    }

    console.error(exception);

    super.catch(new InternalServerErrorException('Something went wrong'), host);
  }
}
