import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateNpcDialogueOptionDto } from './create-npc-dialogue-option.dto';

export class CreateOptionsDto {
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CreateNpcDialogueOptionDto)
  options: CreateNpcDialogueOptionDto[];
}
