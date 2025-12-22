import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin, AdminSchema } from './admin.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Permissions, PermissionsSchema} from '../config/config.permissions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    MongooseModule.forFeature([{ name: Permissions.name, schema: PermissionsSchema }]),
    
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports:[MongooseModule] 
})
export class AdminModule {}
