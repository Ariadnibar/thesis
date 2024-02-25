import { Controller, Get, UseGuards } from '@nestjs/common';

import { User } from '~/modules/users/entities/user.entity';
import { JwtAuthGuard } from '~/core/guards/jwt-auth-guard.decorator';
import { CurrentUser } from '~/core/decorators/current-user.decorator';

@Controller('/users')
export class UsersController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  public async getProfile(@CurrentUser() user: User) {
    return {
      ...user,
      password: undefined,
    };
  }
}
