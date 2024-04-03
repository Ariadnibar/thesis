import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Repository } from 'typeorm';

import { Npc } from '~/modules/npcs/entities/npc.entity';
import { NpcDialogue } from '~/modules/npcs/entities/npc-dialogue.entity';
import { NpcDialogueOption } from '~/modules/npcs/entities/npc-dialogue-option.entity';
import { MessagesService } from '~/modules/messages/messages.service';
import { CreateNpcDto } from '~/modules/npcs/dto/create-npc.dto';
import { CreateNpcDialogueDto } from '~/modules/npcs/dto/create-npc-dialogue.dto';
import { MessageType } from '~/core/enums/message-type.enum';
import { OpenAiService } from '~/modules/openai/openai.service';
import { LoggingService } from '~/modules/logging/logging.service';
import { ActionLog } from '~/core/enums/action-log.enum';
import { CreateNpcDialogueOptionDto } from './dto/create-npc-dialogue-option.dto';
import { CreateOptionsDto } from './dto/create-options.dto';

@Injectable()
export class NpcsService {
  constructor(
    @InjectRepository(Npc)
    private readonly npcsRepository: Repository<Npc>,
    @InjectRepository(NpcDialogue)
    private readonly npcDialoguesRepository: Repository<NpcDialogue>,
    @InjectRepository(NpcDialogueOption)
    private readonly npcDialogueOptionsRepository: Repository<NpcDialogueOption>,

    private readonly messagesService: MessagesService,
    private readonly openAiService: OpenAiService,
    private readonly loggingService: LoggingService,

    private readonly dataSource: DataSource,
  ) {}

  public async findAllNpcs(): Promise<Npc[]> {
    return await this.npcsRepository.find({
      relations: {
        dialogue: {
          options: true,
        },
      },
    });
  }

  public async findNpcById(id: string): Promise<Npc | undefined> {
    try {
      const res = await this.npcsRepository.findOne({
        where: {
          id,
        },
        relations: {
          dialogue: {
            options: true,
          },
        },
        select: {
          id: true,
          type: true,
          context: true,
          dialogue: {
            content: true,
            options: {
              id: true,
              action: true,
              content: true,
              nextDialogueId: true,
            },
          },
        },
      });

      return res;
    } catch (e) {
      return undefined;
    }
  }

  public async findOptionById(id: string): Promise<NpcDialogueOption | undefined> {
    try {
      const res = await this.npcDialogueOptionsRepository.findOne({
        where: {
          id,
        },
        relations: {
          nextDialogue: {
            options: true,
          },
        },
      });

      return res;
    } catch (e) {
      return undefined;
    }
  }

  public async createNpc({ type, context, dialogue }: CreateNpcDto): Promise<Npc | undefined> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdDialogue = dialogue && (await this.createDialogue(queryRunner.manager, dialogue));

      const createdNpc = queryRunner.manager.create(Npc, {
        type,
        context,
        dialogue: createdDialogue,
      });

      const savedNpc = await queryRunner.manager.save(createdNpc);

      await queryRunner.commitTransaction();

      return savedNpc;
    } catch (e) {
      await queryRunner.rollbackTransaction();

      return undefined;
    } finally {
      await queryRunner.release();
    }
  }

  public async createOptions({ options }: CreateOptionsDto): Promise<NpcDialogueOption[] | undefined> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const createdOptions = await Promise.all(
        options.map(async (option) => {
          const createdOption = await this.createOption(queryRunner.manager, option);

          return createdOption;
        }),
      );

      await queryRunner.commitTransaction();

      return createdOptions;
    } catch (e) {
      await queryRunner.rollbackTransaction();

      return undefined;
    } finally {
      await queryRunner.release();
    }
  }

  public async sendAiMessage(sessionId: string, npc: Npc, content: string): Promise<string | undefined> {
    const aiMessages = await this.getAiMessages(sessionId, npc, content);

    if (!aiMessages) return undefined;

    const openAiMessages = [...aiMessages.previousMessages, ...aiMessages.newMessages].map(({ type, content }) => ({
      content,
      role: this.openAiService.getMessageRole(type),
    }));

    const res = await this.openAiService.sendOpenAiMessages(openAiMessages);

    if (!res) return 'No response from AI';

    await this.messagesService.createMessage(sessionId, { type: MessageType.ASSISTANT, content: res, npcId: npc.id });

    return res;
  }

  public async logNpcNormalSelectedOption(sessionId: string, optionId: string) {
    await this.loggingService.log(sessionId, {
      type: ActionLog.NPC_NORMAL_SELECTED_OPTION,
      message: 'User selected NPC dialogue option',
      npcDialogueOptionId: optionId,
    });
  }

  private async createDialogue(entityManager: EntityManager, dialogue: CreateNpcDialogueDto) {
    const createdDialogue = entityManager.create(NpcDialogue, {
      content: dialogue.content,
    });

    const savedDialogue = await entityManager.save(createdDialogue);

    dialogue.options?.forEach(async ({ action, content, nextDialogue, nextDialogueId }) => {
      const createdOption = entityManager.create(NpcDialogueOption, {
        action,
        content,
        parentDialogueId: savedDialogue.id,
        nextDialogueId,
        nextDialogue: nextDialogue && (await this.createDialogue(entityManager, nextDialogue)),
      });

      await entityManager.save(createdOption);
    });

    return savedDialogue;
  }

  private async createOption(entityManager: EntityManager, option: CreateNpcDialogueOptionDto) {
    const createdOption = entityManager.create(NpcDialogueOption, {
      action: option.action,
      content: option.content,
      parentDialogueId: option.parentDialogueId,
      nextDialogueId: option.nextDialogueId,
      nextDialogue: option.nextDialogue && (await this.createDialogue(entityManager, option.nextDialogue)),
    });

    return await entityManager.save(createdOption);
  }

  private async getAiMessages(sessionId: string, npc: Npc, content: string) {
    const sessionMessagesWithNpc =
      (await this.messagesService.findAllMessagesWithNpcInSession(sessionId, npc.id)) ?? [];

    const hasSentContext = sessionMessagesWithNpc.some(({ type }) => type === MessageType.SYSTEM);

    const messages = hasSentContext
      ? [{ type: MessageType.USER_AI, content, npcId: npc.id }]
      : [
          { type: MessageType.SYSTEM, content: npc.context, npcId: npc.id },
          { type: MessageType.USER_AI, content, npcId: npc.id },
        ];

    const newMessages = await this.messagesService.createMessages(sessionId, messages);

    if (!newMessages) return undefined;

    await this.logMessage(sessionId, newMessages[newMessages.length - 1].id);

    return { previousMessages: sessionMessagesWithNpc, newMessages };
  }

  private async logMessage(sessionId: string, messageId: string) {
    await this.loggingService.log(sessionId, {
      type: ActionLog.NPC_AI_SENT_MESSAGE,
      messageId,
      message: 'User sent message to NPC',
    });
  }
}
