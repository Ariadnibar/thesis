import { IsEnum, IsNotEmpty, IsString, ValidateIf, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateNpcDialogueDto } from '~/modules/npcs/dto/create-npc-dialogue.dto';
import { NpcType } from '~/core/enums/npc-type';

export class CreateNpcDto {
  @IsNotEmpty()
  @IsEnum(NpcType)
  type: NpcType;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((o) => o.type === NpcType.AI)
  context?: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateNpcDialogueDto)
  @ValidateIf((o) => o.type === NpcType.NORMAL)
  dialogue?: CreateNpcDialogueDto;
}
