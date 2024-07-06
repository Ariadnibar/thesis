import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from '~/app.module';
import { CatchAllFilter } from '~/core/filters/catch-all.filter';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new CatchAllFilter(httpAdapter));

  await app.listen(3000);
};

bootstrap();
