import { Injectable } from '@nestjs/common';

import { OpenAI } from 'openai';
import type { ChatCompletionCreateParamsBase, ChatCompletionMessageParam } from 'openai/resources/chat/completions';

import { MessageType } from '~/core/enums/message-type.enum';

@Injectable()
export class OpenAiService {
  private readonly openAiClient: OpenAI;

  private readonly model: ChatCompletionCreateParamsBase['model'];

  constructor() {
    this.openAiClient = new OpenAI();

    this.model = 'gpt-3.5-turbo';
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

  public getMessageRole(type: MessageType): 'system' | 'assistant' | 'user' | undefined {
    switch (type) {
      case MessageType.SYSTEM:
        return 'system';
      case MessageType.ASSISTANT:
        return 'assistant';
      case MessageType.USER_AI:
        return 'user';
      default:
        return undefined;
    }
  }
}
