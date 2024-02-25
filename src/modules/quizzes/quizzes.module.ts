import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Quiz } from '~/modules/quizzes/entities/quiz.entity';
import { Question } from '~/modules/quizzes/entities/question.entity';
import { Answer } from '~/modules/quizzes/entities/answer.entity';
import { QuizzesController } from '~/modules/quizzes/quizzes.controller';
import { QuizzesService } from '~/modules/quizzes/quizzes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer])],
  controllers: [QuizzesController],
  providers: [QuizzesService],
})
export class QuizzesModule {}
