import { Controller, Get, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '~/core/guards/jwt-auth-guard.decorator';
import { CurrentUser } from '~/core/decorators/current-user.decorator';
import { ICurrentUser } from '~/core/types/current-user.type';

@Controller('/users')
export class UsersController {
  constructor() {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  public async getProfile(@CurrentUser() { user }: ICurrentUser) {
    return user;
  }
}
