import { Controller, Get, UseGuards } from '@nestjs/common';

import { StatsService } from './stats.service';
import { JwtAuthGuard } from '~/core/guards/jwt-auth-guard.decorator';
import { RolesGuard } from '~/core/guards/roles-guard';
import { Roles } from '~/core/decorators/roles.decorator';
import { Role } from '~/core/enums/role.enum';

@Controller('/stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('/npcs')
  public async getNpcStats() {
    return await this.statsService.getNpcStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('/quizzes')
  public async getQuizStats() {
    return await this.statsService.getQuizStats();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('/npcs/dialogue-options')
  public async getNpcDialogueOptionsStats() {
    return await this.statsService.getNpcDialogueOptionsStats();
  }
}
