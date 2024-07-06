import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MessageType } from '~/core/enums/message-type.enum';
import { Npc } from '~/modules/npcs/entities/npc.entity';
import { Session } from '~/modules/users/entities/session.entity';

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: MessageType })
  type: MessageType;

  @Column()
  content: string;

  @Column({ name: 'session_id' })
  sessionId: string;

  @ManyToOne(() => Session, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'npc_id', nullable: true })
  npcId?: string;

  @ManyToOne(() => Npc, { onDelete: 'SET NULL', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'npc_id' })
  npc?: Npc;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
