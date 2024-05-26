import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { NpcDialogueOptionAction } from '~/core/enums/npc-dialogue-option-action';
import { NpcDialogue } from '~/modules/npcs/entities/npc-dialogue.entity';

@Entity({ name: 'npc_dialogue_options' })
export class NpcDialogueOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: NpcDialogueOptionAction })
  action: NpcDialogueOptionAction;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ name: 'parent_dialogue_id' })
  parentDialogueId: string;

  @ManyToOne(() => NpcDialogue, (dialogue) => dialogue.options, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'parent_dialogue_id' })
  parentDialogue: NpcDialogue;

  @Column({ name: 'next_dialogue_id', nullable: true })
  nextDialogueId?: string;

  @ManyToOne(() => NpcDialogue, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'next_dialogue_id' })
  nextDialogue?: NpcDialogue;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
