import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

import { Log } from '../logging/entities/log.entity';
import { Npc } from '../npcs/entities/npc.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Log, Npc])],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
