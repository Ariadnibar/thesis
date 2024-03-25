import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

import { ActionLog } from '~/core/enums/action-log.enum';
import { Message } from '~/modules/openai/entities/message.entity';
import { Quiz } from '~/modules/quizzes/entities/quiz.entity';
import { SessionAnswer } from '~/modules/quizzes/entities/session_answers';
import { Session } from '~/modules/users/entities/session.entity';

@Entity({ name: 'logs' })
export class Log {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ActionLog })
  type: ActionLog;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'npc_id', nullable: true })
  npcId?: string;

  @Column({ name: 'message_id', nullable: true })
  messageId?: string;

  @ManyToOne(() => Message, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  messageEntity?: Message;

  @Column({ name: 'slideshow_id', nullable: true })
  slideshowId?: string;

  @Column({ name: 'slide_number', nullable: true })
  slideNumber?: number;

  @Column({ name: 'quiz_id', nullable: true })
  quizId?: string;

  @ManyToOne(() => Quiz, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'quiz_id' })
  quiz?: Quiz;

  @Column({ name: 'session_answer_id', nullable: true })
  sessionAnswerId?: string;

  @ManyToOne(() => SessionAnswer, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'session_answer_id' })
  sessionAnswer?: SessionAnswer;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => Session, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
