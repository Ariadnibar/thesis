import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Quiz } from '~/modules/quizzes/entities/quiz.entity';
import { Question } from '~/modules/quizzes/entities/question.entity';
import { Answer } from '~/modules/quizzes/entities/answer.entity';
import { CreateQuizDto } from '~/modules/quizzes/dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizzesRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,

    private readonly dataSource: DataSource,
  ) {}

  public async findQuizById(id: string): Promise<Quiz | undefined> {
    return await this.quizzesRepository.findOne({
      where: {
        id,
      },
      relations: {
        questions: {
          answers: true,
        },
      },
    });
  }

  public async findAllQuizzes(): Promise<Quiz[]> {
    return await this.quizzesRepository.find({
      relations: {
        questions: {
          answers: true,
        },
      },
    });
  }

  public async createQuiz({ name, questions }: CreateQuizDto): Promise<Quiz | undefined> {
    const quiz = this.quizzesRepository.create({
      name,
      questions,
    });

    try {
      return await this.quizzesRepository.save(quiz);
    } catch (error) {
      return undefined;
    }
  }

  public async updateQuiz(quizId: string, { name, questions }: CreateQuizDto): Promise<Quiz | false | undefined> {
    const quiz = await this.findQuizById(quizId);

    if (!quiz) {
      return undefined;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.remove(quiz);

      const createdQuiz = queryRunner.manager.create(Quiz, {
        id: quizId,
        name,
        questions,
      });

      const res = await queryRunner.manager.save(createdQuiz);

      await queryRunner.commitTransaction();

      return res;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  public async removeQuiz(id: string): Promise<boolean> {
    try {
      await this.quizzesRepository.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
