import { ArrayNotEmpty, IsArray, IsNotEmpty, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateNpcDialogueOptionDto } from '~/modules/npcs/dto/create-npc-dialogue-option.dto';

export class CreateNpcDialogueDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  content: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CreateNpcDialogueOptionDto)
  options?: CreateNpcDialogueOptionDto[];
}
