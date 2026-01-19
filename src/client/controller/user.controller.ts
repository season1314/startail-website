import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'
import { UserClientService } from '../service/user.service'
import { sendMailDto, userRegDto } from '../dto/user.dto'
import { Private } from '../../common.decorator'


@Controller('auth')
export class UserController {
    constructor(
        private readonly userClientService: UserClientService,
    ) { }
    /**
     *  Render home page
     */
    @Get('email')
    async email(@Query() dto: sendMailDto) {
        if (dto.type == "reg") return await this.userClientService.sendRegMail(dto)
    }


    @Get('register')
    @Render('frontend/signup')
    async register() {
        return {
            title: 'home',
            categories: [{ "/auth/register": 'Sign up' }, { "/auth/reset": 'Reset password' }],
            layout: 'frontend/layouts/main',
            menuActivated: "/auth/register",
            type: "mail"
        }
    }

    @Get('register/step')
    @Render('frontend/signup')
    async signup(@Query('code') code: string) {
        if (!code) {
            return {
                categories: [{ "/auth/register": 'Sign up' }, { "/auth/reset": 'Reset password' }],
                layout: 'frontend/layouts/main',
                menuActivated: "/auth/register",
                messages: "The verification link is invalid. Please check the link or request a new one.",
                type: 'error'
            }
        }
        const result = await this.userClientService.checkValidEmail(code)
        if (result.code != 0) {
            return {
                categories: [{ "/auth/register": 'Sign up' }, { "/auth/reset": 'Reset password' }],
                layout: 'frontend/layouts/main',
                menuActivated: "/auth/register",
                messages: result.messages,
                type: 'error'
            }
        }
        return {
            title: 'home',
            categories: [{ "/auth/register": 'Sign up' }, { "/auth/reset": 'Reset password' }],
            layout: 'frontend/layouts/main',
            menuActivated: "/auth/register",
            type: "step"
        }
    }

    @Post('register/step')
    async step(@Body() dto: userRegDto) {


    }
}