import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigSchema, Config } from '../../schema/config.common.schema'
import { AdminModule } from '../admin/admin.module';

@Module({
    imports: [
        AdminModule,
        MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    ],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [
        MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    ]
})

export class ConfigModule { }
