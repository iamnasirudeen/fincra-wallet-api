import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  /**
   * whiteList is enabled so I can strip out possible data that a user
   * can send that doesnt exist in my DTO
   */
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.use(morgan('dev'));
  app.enableCors({ origin: '*' });
  await app.listen(process.env.PORT || 9000);
}
bootstrap();
