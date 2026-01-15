import { MongooseModule } from '@nestjs/mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '../admin/config/config.module'
import { HomeController } from './controller/page.controller'
import { ArticlesClientService } from './service/article.service';
import { ArticlesModule } from '../admin/articles/articles.module'
import { MemoryStorageService } from '../memory-storage.service'
import { ConfigClientService } from './service/config.service'
import { EmailService } from '../mail.service'

@Module({
    imports: [
        ConfigModule,
        ArticlesModule,
    ],
    controllers: [HomeController],
    providers: [ArticlesClientService, MemoryStorageService, ConfigClientService, EmailService],
    exports: [ArticlesClientService],
})
export class ClientCoreModule { }
