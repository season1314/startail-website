import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'
import { UserClientService } from '../service/user.service'
import { sendMailDto } from '../dto/user.dto'
import { Private } from '../../common.decorator'


@Controller()
export class UserController {
    constructor(
        private readonly userClientService: UserClientService,
    ) { }
    /**
     *  Render home page
     */
    @Get('/sendEmail')
    // @Render('backend/articles/tags')
    async index() {
        return await this.userClientService.sendRegMail({ email: 'haoqingshuang@gmail.com' })
    }
}