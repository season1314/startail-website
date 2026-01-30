import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Tags, TagsSchema } from '../../schema/articles.tags.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Articles, ArticlesSchema } from '../../schema/articles.content.schema';
import { MemoryStorageService } from '../../memory-storage.service'
import { ConfigModule } from '../../admin/config/config.module'
import { CommentModule } from '../comment/comment.module'

@Module({
  imports: [
    ConfigModule,
    CommentModule,
    MongooseModule.forFeature([
      { name: Tags.name, schema: TagsSchema },
      { name: Articles.name, schema: ArticlesSchema },
    ])
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, MemoryStorageService],
  exports: [
    MongooseModule.forFeature([
      { name: Tags.name, schema: TagsSchema },
      { name: Articles.name, schema: ArticlesSchema },
    ])
  ]
})
export class ArticlesModule { }
