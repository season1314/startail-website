// src/api-service/blog/blog.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesController } from './articles.controller';
import { ArticlesQueryRepository } from './infrastructure/persistence/article.query.repository';
import { ConfigsQueryRepository } from './infrastructure/persistence/config.query.repository'
import { TagsQueryRepository } from './infrastructure/persistence/tags.query.repository'
import { UsersQueryRepository } from './infrastructure/persistence/user.query.repository'
import { Articles, ArticlesSchema } from '@schema/articles.content.schema';
import { Config, ConfigSchema } from '@schema/config.common.schema'
import { Tags, TagsSchema } from '@schema/articles.tags.schema'
import { User, UserSchema } from '@schema/user.schema'
import { GetHomeArticlesService } from './application/get-home-articles.service';
import { GetWebConfigsService } from './application/get-web-configs.service';
import { ConfigsController } from './configs.controller'
import { UsersController } from './user.controller'
import { OptUserAuthService } from './application/opt-user-auth.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Articles.name, schema: ArticlesSchema },
            { name: Tags.name, schema: TagsSchema },
            { name: Config.name, schema: ConfigSchema },
            { name: User.name, schema: UserSchema }
        ]),
    ],
    controllers: [ArticlesController, ConfigsController, UsersController],
    providers: [
        GetHomeArticlesService,
        GetWebConfigsService,
        OptUserAuthService,

        {
            provide: 'IArticlesQueryRepository',
            useClass: ArticlesQueryRepository,
        },
        {
            provide: 'IConfigsQueryRepository',
            useClass: ConfigsQueryRepository,
        },
        {
            provide: 'IUsersQueryRepository',
            useClass: UsersQueryRepository,
        },
        {
            provide: 'ITagsQueryRepository',
            useClass: TagsQueryRepository,
        },
    ],
})
export class WebModule { }