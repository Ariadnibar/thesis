import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import type { ICurrentUser } from '~/core/types/current-user.type';
import type { IJwtPayload } from '~/core/types/jwt-payload.type';
import { UsersService } from '~/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  public async validate({ sub: userId, session: sessionId }: IJwtPayload): Promise<ICurrentUser> {
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new UnauthorizedException('Invalid token');

    const session = await this.usersService.findUserSession(user.id, sessionId);
    if (!session) throw new UnauthorizedException('Invalid session');

    delete user.password;

    return {
      user,
      session: session.id,
    };
  }
}
