import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from '../../schema/admin.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions, PermissionsSchema } from '../../schema/config.permissions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Permissions.name, schema: PermissionsSchema },
    ]),

  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [
    MongooseModule.forFeature([
      { name: Admin.name, schema: AdminSchema },
      { name: Permissions.name, schema: PermissionsSchema },
    ]),

  ]
})
export class AdminModule { }
