import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, OneToMany } from 'typeorm';

import { NpcDialogueOption } from '~/modules/npcs/entities/npc-dialogue-option.entity';

@Entity({ name: 'npc_dialogues' })
export class NpcDialogue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => NpcDialogueOption, (option) => option.parentDialogue, { cascade: true })
  options: NpcDialogueOption[];
}
