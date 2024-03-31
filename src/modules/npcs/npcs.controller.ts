import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { NpcsService } from '~/modules/npcs/npcs.service';
import { JwtAuthGuard } from '~/core/guards/jwt-auth-guard.decorator';
import { RolesGuard } from '~/core/guards/roles-guard';
import { Roles } from '~/core/decorators/roles.decorator';
import { Role } from '~/core/enums/role.enum';
import { CreateNpcDto } from '~/modules/npcs/dto/create-npc.dto';
import { AiSendMessageDto } from '~/modules/npcs/dto/ai-send-message.dto';
import { CurrentUser } from '~/core/decorators/current-user.decorator';
import { ICurrentUser } from '~/core/types/current-user.type';
import { NpcDialogueOptionAction } from '~/core/enums/npc-dialogue-option-action';
import { Response } from 'express';

@Controller('/npcs')
export class NpcsController {
  constructor(private readonly npcsService: NpcsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  public async findAllNpcs() {
    return await this.npcsService.findAllNpcs();
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  public async findNpcById(@Param('id') id: string) {
    const npc = await this.npcsService.findNpcById(id);

    if (!npc) {
      throw new NotFoundException('NPC not found.');
    }

    return npc;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  public async createNpc(@Body() body: CreateNpcDto) {
    const res = await this.npcsService.createNpc(body);

    if (!res) {
      throw new InternalServerErrorException('Failed to create NPC.');
    }

    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/ai/send-message')
  public async sendAiMessage(@CurrentUser() { session }: ICurrentUser, @Body() { npcId, content }: AiSendMessageDto) {
    const npc = await this.npcsService.findNpcById(npcId);
    if (!npc) throw new NotFoundException('NPC not found');

    const res = await this.npcsService.sendAiMessage(session, npc, content);
    if (!res) throw new InternalServerErrorException('Failed to send message');

    return { message: res };
  }

  @UseGuards(JwtAuthGuard)
  @Get('/normal/select-option/:optionId')
  public async selectOption(
    @CurrentUser() { session }: ICurrentUser,
    @Param('optionId') optionId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const option = await this.npcsService.findOptionById(optionId);
    if (!option) throw new NotFoundException('Option not found');

    await this.npcsService.logNpcNormalSelectedOption(session, optionId);

    if (option.action === NpcDialogueOptionAction.CLOSE) {
      res.status(HttpStatus.NO_CONTENT);

      return;
    }

    if (!option.nextDialogue) {
      throw new InternalServerErrorException('Next dialogue not found');
    }

    return option.nextDialogue;
  }
}
