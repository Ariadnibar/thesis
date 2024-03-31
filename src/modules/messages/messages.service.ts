import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Message } from '~/modules/messages/entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
  ) {}

  public async findAllMessagesWithNpcInSession(sessionId: string, npcId: string): Promise<Message[] | undefined> {
    return (
      (await this.messagesRepository.find({
        where: {
          sessionId,
          npcId,
        },
      })) ?? undefined
    );
  }

  public async createMessage(
    sessionId: string,
    message: Pick<Message, 'type' | 'content' | 'npcId'>,
  ): Promise<Message | undefined> {
    const createdMessage = this.messagesRepository.create({ sessionId, ...message });

    try {
      await this.messagesRepository.save(createdMessage);

      return createdMessage;
    } catch (error) {
      return undefined;
    }
  }

  public async createMessages(
    sessionId: string,
    messages: Pick<Message, 'type' | 'content' | 'npcId'>[],
  ): Promise<Message[] | undefined> {
    const createdMessages = messages.map(({ type, content, npcId }) =>
      this.messagesRepository.create({ sessionId, type, content, npcId }),
    );

    try {
      await this.messagesRepository.save(createdMessages);

      return createdMessages;
    } catch (error) {
      return undefined;
    }
  }
}
