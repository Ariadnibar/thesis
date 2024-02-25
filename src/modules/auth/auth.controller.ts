import { Body, ConflictException, Controller, Post, UseGuards } from '@nestjs/common';

import { AuthService } from '~/modules/auth/auth.service';
import { LocalAuthGuard } from '~/core/guards/local-auth-guard.decorator';
import { CurrentUser } from '~/core/decorators/current-user.decorator';
import { User } from '~/modules/users/entities/user.entity';
import { SignUpDto } from '~/modules/auth/dto/sign-up.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  public async signIn(@CurrentUser() user: User) {
    return await this.authService.signIn(user);
  }

  @Post('/sign-up')
  public async signUp(@Body() { username, password }: SignUpDto) {
    const user = await this.authService.signUp(username, password);

    if (!user) throw new ConflictException('Username already exists');

    return await this.authService.signIn(user);
  }
}
