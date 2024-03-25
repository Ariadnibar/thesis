import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OpenAI } from 'openai';
import type { ChatCompletionCreateParamsBase, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { Message } from '~/modules/openai/entities/message.entity';
import { UsersService } from '~/modules/users/users.service';
import { LoggingService } from '~/modules/logging/logging.service';
import { ActionLog } from '~/core/enums/action-log.enum';

@Injectable()
export class OpenAiService {
  private readonly openAiClient: OpenAI;

  private readonly model: ChatCompletionCreateParamsBase['model'];

  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,

    private readonly usersService: UsersService,
    private readonly loggingService: LoggingService,
  ) {
    this.openAiClient = new OpenAI();

    this.model = 'gpt-3.5-turbo';
  }

  public async sendMessage(sessionId: string, username: string, npcId: string, content: string, context?: string) {
    const sessionMessages = (await this.messagesRepository.find({ where: { sessionId } })).map(({ role, content }) => ({
      role,
      content,
    }));

    const newMessages: Array<Pick<Message, 'role' | 'content'>> = context
      ? [
          { role: 'system', content: context },
          { role: 'user', content },
        ]
      : [{ role: 'user', content }];

    const res = await this.sendOpenAiMessages([...sessionMessages, ...newMessages]);
    if (!res) return undefined;

    const savedMessages = await this.saveMessages(sessionId, [...newMessages, { role: 'assistant', content: res }]);

    const userMessageId = savedMessages.find(({ role }) => role === 'user')?.id;

    await this.loggingService.log(sessionId, {
      type: ActionLog.NPC_SENT_MESSAGE,
      npcId,
      message: `User "${username}" sent message to NPC "${npcId}"`,
      messageId: userMessageId,
    });

    return res;
  }

  public async saveMessages(sessionId: string, messages: Array<Pick<Message, 'role' | 'content'>>) {
    const session = await this.usersService.findSessionById(sessionId);

    const createdMessages = messages.map(({ role, content }) =>
      this.messagesRepository.create({ role, content, session }),
    );

    await this.messagesRepository.save(createdMessages);

    return createdMessages;
  }

  public async sendOpenAiMessages(messages: ChatCompletionMessageParam[]) {
    try {
      const res = await this.openAiClient.chat.completions.create({
        model: this.model,
        messages,
      });

      if (!res.choices.length) return undefined;

      return res.choices[0].message.content;
    } catch (error) {
      return undefined;
    }
  }
}
