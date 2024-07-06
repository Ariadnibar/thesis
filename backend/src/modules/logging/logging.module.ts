import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Log } from '~/modules/logging/entities/log.entity';
import { LoggingController } from '~/modules/logging/logging.controller';
import { LoggingService } from '~/modules/logging/logging.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  controllers: [LoggingController],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
