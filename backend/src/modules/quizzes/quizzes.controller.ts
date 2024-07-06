import {
  BadRequestException,
  Body,
  Controller,
  InternalServerErrorException,
  Get,
  Post,
  Put,
  Delete,
  UseGuards,
  Param,
  NotFoundException,
  Query,
} from '@nestjs/common';

import { QuizzesService } from '~/modules/quizzes/quizzes.service';
import { JwtAuthGuard } from '~/core/guards/jwt-auth-guard.decorator';
import { RolesGuard } from '~/core/guards/roles-guard';
import { Roles } from '~/core/decorators/roles.decorator';
import { Role } from '~/core/enums/role.enum';
import { CreateQuizDto } from '~/modules/quizzes/dto/create-quiz.dto';
import { CurrentUser } from '~/core/decorators/current-user.decorator';
import type { ICurrentUser } from '~/core/types/current-user.type';
import { AnswerQuestionDto } from '~/modules/quizzes/dto/answer-question.dto';
import { LoggingService } from '~/modules/logging/logging.service';
import { ActionLog } from '~/core/enums/action-log.enum';

@Controller('/quizzes')
export class QuizzesController {
  constructor(
    private readonly quizzesService: QuizzesService,
    private readonly loggingService: LoggingService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  public async findAllQuizzes() {
    return await this.quizzesService.findAllQuizzes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/high-scores')
  public async getHighScores(@Query('limit') limit: string) {
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedLimit)) {
      throw new BadRequestException('Invalid limit');
    }

    return await this.quizzesService.getHighScores(parsedLimit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  public async findQuizById(@Param('id') id: string) {
    const quiz = await this.quizzesService.findQuizById(id);

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    return quiz;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  public async createQuiz(@Body() body: CreateQuizDto) {
    const questionWithQuizIdExists = body.questions.some((question) => question.quizId);

    if (questionWithQuizIdExists) {
      throw new BadRequestException('Newly created questions should not have a quizId.');
    }

    const answerWithQuestionIdExists = body.questions.some((question) =>
      question.answers.some((answer) => answer.questionId),
    );

    if (answerWithQuestionIdExists) {
      throw new BadRequestException('Newly created answers should not have a questionId.');
    }

    const res = await this.quizzesService.createQuiz(body);

    if (!res) {
      throw new InternalServerErrorException('Failed to create quiz.');
    }

    return res;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('/:id')
  public async updateQuiz(@Param('id') id: string, @Body() body: CreateQuizDto) {
    const questionWithQuizIdExists = body.questions.some((question) => question.quizId);

    if (questionWithQuizIdExists) {
      throw new BadRequestException('Newly created questions should not have a quizId.');
    }

    const answerWithQuestionIdExists = body.questions.some((question) =>
      question.answers.some((answer) => answer.questionId),
    );

    if (answerWithQuestionIdExists) {
      throw new BadRequestException('Newly created answers should not have a questionId.');
    }

    const res = await this.quizzesService.updateQuiz(id, body);

    if (res === undefined) {
      throw new NotFoundException('Quiz not found.');
    }

    if (res === false) {
      throw new InternalServerErrorException('Failed to update quiz.');
    }

    return res;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('/:id')
  public async removeQuiz(@Param('id') id: string) {
    const quiz = await this.quizzesService.findQuizById(id);

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    const res = await this.quizzesService.removeQuiz(id);

    if (!res) {
      throw new InternalServerErrorException('Failed to remove quiz.');
    }

    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/answer-question')
  public async answerQuestion(
    @CurrentUser() { session, user }: ICurrentUser,
    @Body() { answerId, points }: AnswerQuestionDto,
  ) {
    const sessionAnswer = await this.quizzesService.createSessionAnswer(session, answerId, points);

    if (!sessionAnswer) throw new InternalServerErrorException('Failed to write session answer.');

    await this.loggingService.log(session, {
      type: ActionLog.QUIZ_ANSWER,
      message: `User "${user.username}" answered question`,
      sessionAnswerId: sessionAnswer.id,
    });
  }
}
