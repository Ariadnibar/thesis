import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Log } from '~/modules/logging/entities/log.entity';
import { ActionLog } from '~/core/enums/action-log.enum';

interface LogParams {
  type: ActionLog;
  message: string;

  npcId?: string;
  messageId?: string;
  npcDialogueOptionId?: string;

  slideshowId?: string;
  slideNumber?: number;

  quizId?: string;
  sessionAnswerId?: string;
}

@Injectable()
export class LoggingService {
  constructor(
    @InjectRepository(Log)
    private readonly logsRepository: Repository<Log>,
  ) {}

  public async log(sessionId: string, { type, message, ...rest }: LogParams) {
    const log = this.logsRepository.create({
      sessionId,
      type,
      message,
      ...rest,
    });

    try {
      return await this.logsRepository.save(log);
    } catch (error) {
      return undefined;
    }
  }

  public async logMultiple(sessionId: string, logs: LogParams[]) {
    const logEntities = logs.map(({ type, message, ...rest }) =>
      this.logsRepository.create({
        sessionId,
        type,
        message,
        ...rest,
      }),
    );

    try {
      return await this.logsRepository.save(logEntities);
    } catch (error) {
      return undefined;
    }
  }
}
