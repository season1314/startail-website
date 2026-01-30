import {
    Controller,
    Get,
    Post,
    Put,
    Body,
    Render,
    Res,
    Req,
    Query,
    Session,
    Delete,
    HttpException,
    HttpStatus
} from '@nestjs/common';
import { FormValidationPipe } from '../../middleware.pipe.guard';
import type { Response, Request } from 'express';
import { GetListDto } from '../admin_core.dto';
import { error } from 'console';
import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { UserService } from '../user/user.service'

@Controller()
export class UserController {
    constructor(private readonly UserService: UserService) { }


    /**
 *  Render administrator page
 */

    @Get()
    @Render('backend/user/user')
    index() {
        return {
            title: 'User',
            bc: [
                { url: '/admin', name: 'Dashboard' },
                { url: '#', name: 'User' },
            ],
        };
    }


    /**
     * Get user list
     *
     * HTTP Method: Get
     * Request query:
     * - page:  * (number): Page number
     * - entries: (number): entries : default 20
     * - keyword：(string): email,nickname keyword for search
     *
     * Description:
     *
     * base the page and keyword get user list
     */

    @Get('list')
    async list(@Query() dto: GetListDto) {
        return await this.UserService.userList(dto)
    }

    /**
     * Switch user status
     * 
     * HTTP Method:Put
     * -Id:user Id
     * 
     * Description:
     * 
     * verify user existed
     * switch user status base current status
     * delete or create backlist cache 
     * 
     */
    @Put()
    async switchStatus(@Body('userId') userId: string | null | undefined) {
        return await this.UserService.switchUserStatus(userId)
    }
}  