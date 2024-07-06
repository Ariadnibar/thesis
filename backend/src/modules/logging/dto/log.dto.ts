import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class LogNpcDto {
  @IsNotEmpty()
  @IsString()
  npcId: string;
}

export class LogSlideshowDto {
  @IsNotEmpty()
  @IsString()
  slideshowId: string;
}

export class LogSlideshowSeenSlideDto extends LogSlideshowDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  slideNumber: number;
}

export class LogQuizDto {
  @IsNotEmpty()
  @IsString()
  quizId: string;
}
