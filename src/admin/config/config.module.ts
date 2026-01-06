import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { Permissions, PermissionsSchema } from '../../schema/config.permissions.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigSchema, Config } from '../../schema/config.common.schema'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Permissions.name, schema: PermissionsSchema }]),
        MongooseModule.forFeature([{ name: Config.name, schema: ConfigSchema }]),
    ],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [MongooseModule]
})

export class ConfigModule { }
