import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { LoggingService } from './logging.service';
import { JwtAuthGuard } from '~/core/guards/jwt-auth-guard.decorator';
import { CurrentUser } from '~/core/decorators/current-user.decorator';
import { ICurrentUser } from '~/core/types/current-user.type';
import { LogNpcDto, LogQuizDto, LogSlideshowDto, LogSlideshowSeenSlideDto } from '~/modules/logging/dto/log.dto';
import { ActionLog } from '~/core/enums/action-log.enum';

@Controller('/logs')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/write/npc-start-interaction')
  public async writeNpcStartInteractionLog(@CurrentUser() { session }: ICurrentUser, @Body() { npcId }: LogNpcDto) {
    await this.loggingService.log(session, {
      type: ActionLog.NPC_START_INTERACTION,
      message: `User started interacting with NPC`,
      npcId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/write/npc-end-interaction')
  public async writeNpcEndInteractionLog(@CurrentUser() { session }: ICurrentUser, @Body() { npcId }: LogNpcDto) {
    await this.loggingService.log(session, {
      type: ActionLog.NPC_END_INTERACTION,
      message: `User stopped interacting with NPC`,
      npcId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/write/slideshow-start')
  public async writeSlideshowStartLog(
    @CurrentUser() { session, user }: ICurrentUser,
    @Body() { slideshowId, slideNumber }: LogSlideshowSeenSlideDto,
  ) {
    await this.loggingService.logMultiple(session, [
      {
        type: ActionLog.SLIDESHOW_START,
        message: `User "${user.username}" started slideshow "${slideshowId}"`,
        slideshowId,
      },
      {
        type: ActionLog.SLIDESHOW_SEEN_SLIDE,
        message: `User "${user.username}" saw slide of slideshow "${slideshowId}"`,
        slideshowId,
        slideNumber,
      },
    ]);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/write/slideshow-end')
  public async writeSlideshowEndLog(
    @CurrentUser() { session, user }: ICurrentUser,
    @Body() { slideshowId }: LogSlideshowDto,
  ) {
    await this.loggingService.log(session, {
      type: ActionLog.SLIDESHOW_END,
      message: `User "${user.username}" ended slideshow "${slideshowId}"`,
      slideshowId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/write/slideshow-seen-slide')
  public async writeSlideshowSeenSlideLog(
    @CurrentUser() { session, user }: ICurrentUser,
    @Body() { slideshowId, slideNumber }: LogSlideshowSeenSlideDto,
  ) {
    await this.loggingService.log(session, {
      type: ActionLog.SLIDESHOW_SEEN_SLIDE,
      message: `User "${user.username}" saw slide of slideshow "${slideshowId}"`,
      slideshowId,
      slideNumber,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/write/quiz-start')
  public async writeQuizStartLog(@CurrentUser() { session, user }: ICurrentUser, @Body() { quizId }: LogQuizDto) {
    await this.loggingService.log(session, {
      type: ActionLog.QUIZ_START,
      message: `User "${user.username}" started quiz "${quizId}"`,
      quizId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/write/quiz-end')
  public async writeQuizEndLog(@CurrentUser() { session, user }: ICurrentUser, @Body() { quizId }: LogQuizDto) {
    await this.loggingService.log(session, {
      type: ActionLog.QUIZ_END,
      message: `User "${user.username}" ended quiz "${quizId}"`,
      quizId,
    });
  }
}
