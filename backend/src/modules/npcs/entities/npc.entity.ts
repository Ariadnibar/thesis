import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { NpcType } from '~/core/enums/npc-type';
import { NpcDialogue } from '~/modules/npcs/entities/npc-dialogue.entity';

@Entity({ name: 'npcs' })
export class Npc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NpcType, default: NpcType.NORMAL })
  type: NpcType;

  @Column({ nullable: true })
  context?: string;

  @Column({ name: 'dialogue_id', nullable: true })
  dialogueId?: string;

  @OneToOne(() => NpcDialogue, { onDelete: 'CASCADE', onUpdate: 'CASCADE', cascade: true })
  @JoinColumn({ name: 'dialogue_id' })
  dialogue?: NpcDialogue;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
