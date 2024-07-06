import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '~/modules/users/entities/user.entity';
import { Session } from '~/modules/users/entities/session.entity';
import { UsersController } from '~/modules/users/users.controller';
import { UsersService } from '~/modules/users/users.service';

import { EncryptionModule } from '~/modules/encryption/encryption.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session]), EncryptionModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
