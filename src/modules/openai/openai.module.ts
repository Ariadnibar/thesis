import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from '~/modules/openai/entities/message.entity';
import { OpenAiController } from '~/modules/openai/openai.controller';
import { OpenAiService } from '~/modules/openai/openai.service';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UsersModule],
  controllers: [OpenAiController],
  providers: [OpenAiService],
  exports: [OpenAiService],
})
export class OpenAiModule {}
