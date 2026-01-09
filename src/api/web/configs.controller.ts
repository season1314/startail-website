import { Controller, Get, Query, Param, ParseIntPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { GetWebConfigsService } from './application/get-web-configs.service';

@Controller('/api/v1/web')
export class ConfigsController {
    constructor(
        private readonly getWebConfigsService: GetWebConfigsService
    ) { }

    @Get('menu')
    async menu() {
        return await this.getWebConfigsService.menu();
    }
}