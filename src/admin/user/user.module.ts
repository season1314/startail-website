import { Module } from '@nestjs/common';
import { User, UserSchema } from '../../schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions, PermissionsSchema } from '../../schema/config.permissions.schema';
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { MemoryStorageService } from '../../memory-storage.service'

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    ],
    controllers: [UserController],
    providers: [UserService,MemoryStorageService],
    exports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),

    ]
})
export class UserModule { }
