import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateNpcDialogueOptionDto } from '~/modules/npcs/dto/create-npc-dialogue-option.dto';

export class CreateNpcDialogueDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  content: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CreateNpcDialogueOptionDto)
  options: CreateNpcDialogueOptionDto[];
}
