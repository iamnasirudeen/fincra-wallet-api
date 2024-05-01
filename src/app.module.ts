import {
  MiddlewareConsumer,
  Module,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HelmetMiddleware } from '@nest-middlewares/helmet';
import { AuthenticationMiddleware } from './common/middlewares/auth.middleware';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TransactionModule } from './transaction/transaction.module';
import { TransferModule } from './transfer/transfer.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env'),
    }),
    MongooseModule.forRoot(process.env.DATABASE_URI, {
      autoIndex: true,
    }),
    AuthModule,
    UserModule,
    TransactionModule,
    TransferModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    HelmetMiddleware.configure({
      dnsPrefetchControl: false,
      frameguard: true,
      hidePoweredBy: true,
    });

    consumer.apply(HelmetMiddleware).forRoutes('*');
    consumer
      .apply(AuthenticationMiddleware)
      .exclude(
        { path: '/auth/login', method: RequestMethod.POST },
        { path: '/users/signup', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
