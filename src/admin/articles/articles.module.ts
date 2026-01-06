import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Tags, TagsSchema } from '../../schema/articles.tags.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigSchema, Config } from '../../schema/config.common.schema'
import { Articles, ArticlesSchema } from '../../schema/articles.content.schema';
import { MemoryStorageService } from '../../memory-storage.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tags.name, schema: TagsSchema }]),
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    MongooseModule.forFeature([{ name: Articles.name, schema: ArticlesSchema }])

  ],
  controllers: [ArticlesController],
  providers: [ArticlesService, MemoryStorageService],
  exports: [MongooseModule]
})
export class ArticlesModule { }
