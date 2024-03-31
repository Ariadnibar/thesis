import { IsEnum, IsNotEmpty, IsString, MinLength, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateNpcDialogueDto } from '~/modules/npcs/dto/create-npc-dialogue.dto';
import { NpcDialogueOptionAction } from '~/core/enums/npc-dialogue-option-action';

export class CreateNpcDialogueOptionDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  content: string;

  @IsNotEmpty()
  @IsEnum(NpcDialogueOptionAction)
  action: NpcDialogueOptionAction;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateNpcDialogueDto)
  @ValidateIf((o) => o.action === NpcDialogueOptionAction.NEXT)
  nextDialogue: CreateNpcDialogueDto;
}
