import { Controller, Get, Query, Param, ParseIntPipe, HttpStatus, HttpCode, Post } from '@nestjs/common';
import { OptUserAuthService } from './application/opt-user-auth.service';

@Controller('/api/v1/web')
export class UsersController {
    constructor(
        private readonly optUserAuthService: OptUserAuthService
    ) { }

    @Get('user/email/:email')
    async getUserInfo(@Param('email') email: string) {
        return await this.optUserAuthService.userByEmail(email);
    }
}