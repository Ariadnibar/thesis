import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '~/modules/users/entities/user.entity';
import { Session } from '~/modules/users/entities/session.entity';
import { EncryptionService } from '~/modules/encryption/encryption.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,

    private readonly encryptionService: EncryptionService,
  ) {}

  /**
   * Create a new user
   * @returns The created user or undefined if the username is already taken
   */
  public async create(username: string, password: string): Promise<User | undefined> {
    const user = await this.findOneByUsername(username);

    if (user) return undefined;

    return await this.usersRepository.save({ username, password: await this.encryptionService.hash(password) });
  }

  public async startSession(userId: string): Promise<Session> {
    return await this.sessionsRepository.save({ userId });
  }

  public async findOneById(id: string): Promise<User | undefined> {
    return (await this.usersRepository.findOne({ where: { id } })) ?? undefined;
  }

  public async findOneByUsername(username: string): Promise<User | undefined> {
    return (await this.usersRepository.findOne({ where: { username } })) ?? undefined;
  }

  public async findSessionById(id: string): Promise<Session | undefined> {
    return (await this.sessionsRepository.findOne({ where: { id } })) ?? undefined;
  }

  public async findUserSession(userId: string, sessionId: string): Promise<Session | undefined> {
    return (await this.sessionsRepository.findOne({ where: { userId, id: sessionId } })) ?? undefined;
  }
}
