import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Match } from '~/core/decorators/match.decorator';

export class SignUpDto {
  @IsNotEmpty()
  @IsString()
  @Length(4, 20)
  username: string;

  @IsNotEmpty()
  @IsString()
  @Length(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  @Match(SignUpDto, (s) => s.password, { message: 'password and confirmPassword do not match' })
  confirmPassword: string;
}
