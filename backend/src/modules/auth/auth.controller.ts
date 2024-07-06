import { Body, ConflictException, Controller, InternalServerErrorException, Post, UseGuards } from '@nestjs/common';

import { AuthService } from '~/modules/auth/auth.service';
import { LoggingService } from '~/modules/logging/logging.service';
import { LocalAuthGuard } from '~/core/guards/local-auth-guard.decorator';
import { CurrentUser } from '~/core/decorators/current-user.decorator';
import { User } from '~/modules/users/entities/user.entity';
import { SignUpDto } from '~/modules/auth/dto/sign-up.dto';
import { ActionLog } from '~/core/enums/action-log.enum';

@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logsService: LoggingService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/sign-in')
  public async signIn(@CurrentUser() user: User) {
    const { access_token, sessionId } = await this.authService.signIn(user);

    if (!access_token) throw new InternalServerErrorException('Failed to sign in');

    await this.logsService.log(sessionId, { type: ActionLog.SIGN_IN, message: `User "${user.username}" signed in` });

    return { access_token };
  }

  @Post('/sign-up')
  public async signUp(@Body() { username, password }: SignUpDto) {
    const user = await this.authService.signUp(username, password);

    if (!user) throw new ConflictException('Username already exists');

    const { access_token, sessionId } = await this.authService.signIn(user);

    if (!access_token) throw new InternalServerErrorException('Failed to sign up');

    await this.logsService.logMultiple(sessionId, [
      { type: ActionLog.SIGN_UP, message: `User "${user.username}" signed up` },
      { type: ActionLog.SIGN_IN, message: `User "${user.username}" signed in` },
    ]);

    return { access_token };
  }
}
