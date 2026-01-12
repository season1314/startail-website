import { Controller, Get, Query, Param, ParseIntPipe, HttpStatus, HttpCode, Post, Body, Put } from '@nestjs/common';
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

    @Post('user')
    async createUser(@Body() user: any) {
        const aa = await this.optUserAuthService.createUser(user)
        console.log(aa)
        return aa
    }

    @Put('user')
    async updateUser(@Body() user: any) {
        return await this.optUserAuthService.updataUser(user)
    }

    @Get('user/password/:email')
    async getUserInfoWithPsd(@Param('email') email: string) {
        return await this.optUserAuthService.userByEmailWithPass(email);
    }
}