import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AiSendMessageDto {
  @IsNotEmpty()
  @IsString()
  npcId: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  content: string;
}
