import { MongooseModule } from '@nestjs/mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '../admin/config/config.module'
import { HomeController } from './controller/page.controller'
import { ArticlesClientService } from './service/article.service';
import { ArticlesModule } from '../admin/articles/articles.module'
import { MemoryStorageService } from '../memory-storage.service'
import { ConfigClientService } from './service/config.service'
import { EmailService } from '../mail.service'
import { User, UserSchema } from '../schema/user.schema'
import { UserController } from './controller/user.controller'
import { CryptoService } from '../crypto.service'
import { UserClientService } from '../client/service/user.service'
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService as NextConfigService, ConfigModule as NextConfigModule } from '@nestjs/config';
import { Favorite, FavoriteSchema } from '../schema/user.favorite.schema'
import { Comment, CommentSchema } from '@schema/articles.comment.schema';
import { ArticleController } from './controller/article.controller';
import { CommentClientService } from './service/article.comment.service'

@Module({
    imports: [
        ConfigModule,
        ArticlesModule,
        NextConfigModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [NextConfigModule],
            inject: [NextConfigService],
            useFactory: (configService: NextConfigService) => ({
                secret: configService.get<string>('JWT_SECRET') || 'default_secret_here',
                signOptions: { expiresIn: '920h' },
            }),
        }),
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Favorite.name, schema: FavoriteSchema },
            { name: Comment.name, schema: CommentSchema }

        ]),
    ],
    controllers: [HomeController, UserController, ArticleController],
    providers: [ArticlesClientService, MemoryStorageService, ConfigClientService, EmailService, CryptoService, UserClientService, JwtStrategy,CommentClientService],
    exports: [ArticlesClientService],
})
export class ClientCoreModule { }
