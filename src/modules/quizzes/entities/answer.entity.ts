import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Question } from '~/modules/quizzes/entities/question.entity';

@Entity({ name: 'answers' })
@Unique(['content', 'questionId'])
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ name: 'is_correct' })
  isCorrect: boolean;

  @Column({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
