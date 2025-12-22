import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { Permissions, PermissionsSchema } from './config.permissions.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Permissions.name, schema: PermissionsSchema }]),
    ],
    controllers: [ConfigController],
    providers: [ConfigService],
    exports: [MongooseModule]
})

export class ConfigModule { }
