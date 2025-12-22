import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
// import { AdminModule } from '../admin/admin.module';

@Module({
  controllers: [DashboardController],
//   providers: [AuthService]
})
export class DashboardModule {}
