import { Body, Controller, InternalServerErrorException, Post, UseGuards } from '@nestjs/common';

import { OpenAiService } from '~/modules/openai/openai.service';
import { JwtAuthGuard } from '~/core/guards/jwt-auth-guard.decorator';
import { CurrentUser } from '~/core/decorators/current-user.decorator';
import { ICurrentUser } from '~/core/types/current-user.type';
import { SendMessageDto } from '~/modules/openai/dto/send-message.dto';

@Controller('/openai')
export class OpenAiController {
  constructor(private readonly openAiService: OpenAiService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/send-message')
  public async sendMessage(
    @CurrentUser() { session, user }: ICurrentUser,
    @Body() { npcId, content, context }: SendMessageDto,
  ) {
    const res = await this.openAiService.sendMessage(session, user.username, npcId, content, context);

    if (!res) throw new InternalServerErrorException('Failed to send message');

    return { message: res };
  }
}
