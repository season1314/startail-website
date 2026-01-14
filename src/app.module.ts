import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AdminCoreModule } from './admin/admin_core.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiServiceModule } from './api/api.module'
import { RouterModule } from '@nestjs/core';
@Module({
  imports: [
    AdminCoreModule.forRoot(),
    ApiServiceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV ||'development'}`,
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
        dbName: config.get<string>('MONGO_DB'),
      }),
      inject: [ConfigService],
    })
  ]
})

export class AppModule { }
