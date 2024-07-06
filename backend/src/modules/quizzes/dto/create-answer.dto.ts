import { IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateAnswerDto {
  @IsNotEmpty()
  @IsString()
  @Length(3)
  content: string;

  @IsNotEmpty()
  @IsBoolean()
  isCorrect: boolean;

  @IsOptional()
  @IsString()
  questionId?: string;
}
