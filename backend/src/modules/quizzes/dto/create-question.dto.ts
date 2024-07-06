import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CreateAnswerDto } from '~/modules/quizzes/dto/create-answer.dto';

export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  @Length(3)
  content: string;

  @IsNotEmpty()
  @IsNumber()
  order: number;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested()
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];

  @IsOptional()
  @IsString()
  quizId?: string;
}
