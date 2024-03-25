import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  npcId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  content: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  context?: string;
}
