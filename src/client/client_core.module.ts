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
import { userModule } from './module.ts/user.module'

@Module({
    imports: [
        ConfigModule,
        userModule,
        ArticlesModule,
    ],
    controllers: [HomeController, UserController],
    providers: [ArticlesClientService, MemoryStorageService, ConfigClientService, EmailService, CryptoService],
    exports: [ArticlesClientService],
})
export class ClientCoreModule { }
