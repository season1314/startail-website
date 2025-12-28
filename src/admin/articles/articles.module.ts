import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Tags,TagsSchema } from './articles.tags.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigSchema, Config } from '../config/config.common.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Tags.name, schema: TagsSchema }]),
    MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports:[MongooseModule] 
})
export class ArticlesModule {}
