import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { MemoryStorageService } from '../../memory-storage.service'
import { UserModule } from '../user/user.module'
import { CommentModule } from '../comment/comment.module';
import { ArticlesModule } from '../articles/articles.module';
import { ArticlesService } from '../articles/articles.service';
import { ConfigModule } from '../config/config.module';


@Module({
  imports: [
    UserModule,
    CommentModule,
    ArticlesModule,
    ConfigModule
  ],
  controllers: [DashboardController],
  providers: [DashboardService, MemoryStorageService, ArticlesService]
})
export class DashboardModule { }
