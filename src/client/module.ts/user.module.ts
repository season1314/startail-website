import { MongooseModule } from '@nestjs/mongoose';
import { Module, DynamicModule, Global } from '@nestjs/common';
import { ConfigModule } from '../../admin/config/config.module'
import { MemoryStorageService } from '../../memory-storage.service'
import { EmailService } from '../../mail.service'
import { User, UserSchema } from '../../schema/user.schema'
import { UserController } from '../controller/user.controller'
import { CryptoService } from '../../crypto.service'
import { UserClientService } from '../../client/service/user.service'
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        PassportModule,
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'default_secret',
          signOptions: { expiresIn: '920h' },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],
    controllers: [UserController],
    providers: [MemoryStorageService, EmailService, CryptoService, UserClientService, JwtStrategy],
    exports: [UserClientService, JwtStrategy],
})
export class userModule { }
