import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

import { CreateQuestionDto } from '~/modules/quizzes/dto/create-question.dto';

export class CreateQuizDto {
  @IsNotEmpty()
  @IsString()
  @Length(3)
  name: string;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested()
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
