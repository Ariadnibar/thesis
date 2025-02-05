import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from '~/modules/users/entities/user.entity';
import { UsersService } from '~/modules/users/users.service';
import { EncryptionService } from '~/modules/encryption/encryption.service';
import type { IJwtPayload } from '~/core/types/jwt-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly encryptionService: EncryptionService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validate a user
   * @param username
   * @param password
   * @returns The user if the credentials are valid, undefined otherwise
   */
  public async validateUser(username: string, password: string): Promise<User | undefined> {
    const user = await this.usersService.findOneByUsername(username);

    if (user && (await this.encryptionService.compare(password, user.password))) return user;

    return undefined;
  }

  /**
   * Sign in a user
   * @param user
   * @returns An access token
   */
  public async signIn(user: User) {
    const session = await this.usersService.startSession(user.id);

    if (!session) return undefined;

    const payload: IJwtPayload = { username: user.username, sub: user.id, session: session.id };

    return { access_token: this.jwtService.sign(payload), sessionId: session.id };
  }

  /**
   * Sign up a user
   * @returns The created user or undefined if the username is already taken
   */
  public async signUp(username: string, password: string) {
    return await this.usersService.create(username, password);
  }
}
