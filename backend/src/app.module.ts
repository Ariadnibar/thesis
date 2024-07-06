import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LoggingModule } from '~/modules/logging/logging.module';
import { EncryptionModule } from '~/modules/encryption/encryption.module';
import { UsersModule } from '~/modules/users/users.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { QuizzesModule } from '~/modules/quizzes/quizzes.module';
import { OpenAiModule } from '~/modules/openai/openai.module';
import { NpcsModule } from '~/modules/npcs/npcs.module';
import { StatsModule } from '~/modules/stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PG_HOST'),
        port: configService.get<number>('PG_PORT'),
        username: configService.get<string>('PG_USER'),
        password: configService.get<string>('PG_PASSWORD'),
        database: configService.get<string>('PG_DATABASE'),

        autoLoadEntities: true,

        synchronize: configService.get<string>('NODE_ENV') !== 'production',
      }),
    }),

    LoggingModule,

    EncryptionModule,
    UsersModule,
    AuthModule,
    QuizzesModule,
    OpenAiModule,
    NpcsModule,
    StatsModule,
  ],
})
export class AppModule {}
