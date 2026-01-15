import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AdminCoreModule } from './admin/admin_core.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RouterModule } from '@nestjs/core';
import { ClientCoreModule } from './client/client_core.module'
import { EmailService } from './mail.service'
@Module({
  imports: [
    AdminCoreModule.forRoot(),
    ClientCoreModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: config.get<string>('MONGO_DB'),
      }),
      inject: [ConfigService],
    })
  ],
  providers: [EmailService],
  exports: [EmailService],
})

export class AppModule { }
