import { Module } from '@nestjs/common';
import { WebModule } from './web/web.module';  

@Module({
 imports: [WebModule],
})
export class ApiServiceModule {}