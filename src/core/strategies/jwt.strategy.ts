import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

import { User } from '~/modules/users/entities/user.entity';
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

  public async validate({ sub: userId }: { sub: string; username: string }): Promise<User> {
    const user = await this.usersService.findOneById(userId);

    if (!user) throw new UnauthorizedException('Invalid token');

    return user;
  }
}
