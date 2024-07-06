import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { ActionLog } from '~/core/enums/action-log.enum';

import { Log } from '../logging/entities/log.entity';
import { SessionAnswer } from '../quizzes/entities/session_answers';
import { Npc } from '../npcs/entities/npc.entity';
import { NpcType } from '~/core/enums/npc-type';

@Injectable()
export class StatsService {
  private readonly quizMaxScores = {
    '32f4534c-7a7d-4e4d-a4da-dae8936eb430': 150,
    '45eebaa8-07c4-46fb-b23f-ef0fbfe5dcf6': 100,
    '6cfb1e56-d9ae-4712-af15-7db877509dad': 60,
    '822aee91-99e6-4f7d-9ead-830e70578d94': 60,
  };

  private readonly npcNameMap = {
    '582c6230-ad48-4eb1-bac9-e159fb238f0c': 'NPC - Βασικές αρχές Επιχειρηματικού Σχεδίου',
    '7e7482e8-325a-4988-b3cd-1cd0b65a2ad4': 'NPC - Επιχειρηματικότητα',
  };

  constructor(
    @InjectRepository(Log)
    private readonly logsRepository: Repository<Log>,
    @InjectRepository(Npc)
    private readonly npcsRepository: Repository<Npc>,

    private readonly dataSource: DataSource,
  ) {}

  public async getNpcStats() {
    const npcInteractions = await this.getNpcInteractionsByType();

    return {
      interactions: npcInteractions.map((interaction) => ({
        type: interaction.interaction_type,
        interactions: parseInt(interaction.interactions, 10),
        users: parseInt(interaction.users, 10),
      })),
    };
  }

  public async getQuizStats() {
    const averageQuizScores = await this.getAverageQuizScores();

    // Normalize the scores based on the max score for each quiz
    const normalizedScores = averageQuizScores.map((score) => ({
      name: score.name,
      avg_points: parseFloat(((parseFloat(score.avg_points) / this.quizMaxScores[score.id]) * 100).toFixed(2)),
    }));

    return normalizedScores;
  }

  public async getNpcDialogueOptionsStats() {
    const npcDialogueOptionsClicks = await this.getNpcDialogueOptionsClicks();

    // Merge all NPC dialogue options into a single object
    const npcDialogueOptions = npcDialogueOptionsClicks.reduce((acc, option) => {
      if (!acc[option.npc_id]) {
        acc[option.npc_id] = [];
      }

      acc[option.npc_id].push({
        content: option.content,
        clicks: parseInt(option.clicks, 10),
      });

      return acc;
    }, {});

    return Object.keys(npcDialogueOptions).map((npcId) => ({
      npc: this.npcNameMap[npcId],
      dialogueOptions: npcDialogueOptions[npcId],
    }));
  }

  private async getNpcInteractionsByType() {
    const query = this.logsRepository
      .createQueryBuilder('log')
      .select('log.type as interaction_type, COUNT(log.id) as interactions, COUNT(DISTINCT username) as users')
      .leftJoin('log.session', 'session')
      .leftJoin('session.user', 'user')
      .where('log.type = :type1', { type1: ActionLog.NPC_AI_SENT_MESSAGE })
      .orWhere('log.type = :type2', { type2: ActionLog.NPC_NORMAL_SELECTED_OPTION })
      .groupBy('log.type');

    return await query.getRawMany<{
      interaction_type: string;
      interactions: string;
      users: string;
    }>();
  }

  private async getAverageQuizScores() {
    const query = this.dataSource
      .createQueryBuilder()
      .select('id, name, avg(points) as avg_points')
      .from((subQuery) => {
        return subQuery
          .select('qz.id, qz.name, sum(sa.points) as points')
          .from(SessionAnswer, 'sa')
          .leftJoin('sa.answer', 'a')
          .leftJoin('a.question', 'q')
          .leftJoin('q.quiz', 'qz')
          .leftJoin('sa.session', 's')
          .leftJoin('s.user', 'u')
          .where('u.role != :role', { role: 'admin' })
          .groupBy('sa.session_id, qz.id');
      }, 'sub')
      .groupBy('id, name');

    return await query.getRawMany<{
      id: string;
      name: string;
      avg_points: string;
    }>();
  }

  private async getNpcDialogueOptionsClicks() {
    const npcs = await this.npcsRepository.find({ where: { type: NpcType.NORMAL } });

    const query = this.dataSource
      .createQueryBuilder()
      .select('sub.content, sub.clicks, npcs.id as npc_id')
      .from((subQuery) => {
        return subQuery
          .select('ndo.content, ndo.parent_dialogue_id, count(*) as clicks')
          .from(Log, 'l')
          .leftJoin('l.npcDialogueOption', 'ndo')
          .leftJoin('ndo.parentDialogue', 'ndo2')
          .where('l.type = :type', { type: ActionLog.NPC_NORMAL_SELECTED_OPTION })
          .andWhere('ndo.parentDialogueId IN (:...npcsDialogueIds)', {
            npcsDialogueIds: npcs.map((npc) => npc.dialogueId),
          })
          .groupBy('ndo.id');
      }, 'sub')
      .leftJoin('npcs', 'npcs', 'sub.parent_dialogue_id = npcs.dialogue_id')
      .orderBy('clicks', 'DESC');

    return await query.getRawMany<{
      content: string;
      clicks: string;
      npc_id: string;
    }>();
  }
}
