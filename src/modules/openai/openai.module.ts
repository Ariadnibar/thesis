import { Module } from '@nestjs/common';

import { OpenAiService } from '~/modules/openai/openai.service';
import { UsersModule } from '~/modules/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [OpenAiService],
  exports: [OpenAiService],
})
export class OpenAiModule {}
