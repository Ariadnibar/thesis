import { IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf, ValidateNested } from 'class-validator';
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

  @IsOptional()
  @IsString()
  parentDialogueId?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateNpcDialogueDto)
  @ValidateIf((o) => o.action === NpcDialogueOptionAction.NEXT && !o.nextDialogueId)
  nextDialogue?: CreateNpcDialogueDto;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => o.action === NpcDialogueOptionAction.NEXT && !o.nextDialogue)
  nextDialogueId?: string;
}
