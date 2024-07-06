import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Npc } from '~/modules/npcs/entities/npc.entity';
import { NpcDialogue } from '~/modules/npcs/entities/npc-dialogue.entity';
import { NpcDialogueOption } from '~/modules/npcs/entities/npc-dialogue-option.entity';
import { NpcsController } from '~/modules/npcs/npcs.controller';
import { NpcsService } from '~/modules/npcs/npcs.service';
import { OpenAiModule } from '../openai/openai.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [TypeOrmModule.forFeature([Npc, NpcDialogue, NpcDialogueOption]), MessagesModule, OpenAiModule],
  controllers: [NpcsController],
  providers: [NpcsService],
})
export class NpcsModule {}
