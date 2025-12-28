import { Module, DynamicModule, Global } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { DashboardModule } from './dashboard/dashboard.module'
import { RouterModule } from '@nestjs/core';
import { ConfigModule } from './config/config.module'
import { FilesController } from './update.controller';
import {ArticlesModule} from './articles/articles.module'

@Global()
@Module({
  controllers:[FilesController]
})
export class AdminCoreModule {
  static forRoot(): DynamicModule {
    return {
      module: AdminCoreModule,
      imports: [
        AuthModule,
        AdminModule,
        DashboardModule,
        ConfigModule,
        ArticlesModule,
        RouterModule.register([
          {
            path: 'admin',
            module: AuthModule,
          },
          {
            path: 'admin/admin',
            module: AdminModule,
          },
          {
            path: 'admin',
            module: DashboardModule,
          },
          {
            path: 'admin/config',
            module: ConfigModule
          },
          {
            path: 'admin/articles',
            module:ArticlesModule
          }
        ])
      ],
      exports: [
        AuthModule,
        AdminModule
      ],
    };
  }
}