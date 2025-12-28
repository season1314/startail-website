import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put,Query} from '@nestjs/common';
import type { Request, Response } from 'express';
// import { AuthService } from './auth.service';
import { error } from 'console';
import { ValidateAdminDto, ResetPasswordDto } from '../admin/admin.dto'
import * as session from 'express-session';
import { validate } from 'class-validator';
const { promisify } = require('util');
import { FormValidationPipe } from '../admin.pipe';
import { ArticlesService } from './articles.service'
import { GetListDto } from '../admin_core.dto';


@Controller()
export class ArticlesController {
    constructor(private readonly authService: ArticlesService) { }

    /**
     *  Render tags page
     */
    @Get('tags')
    @Render('backend/articles/tags')
    index() {
        return {
            title: 'Tags',
        };
    }

    /**
 * Get administrator list
 *
 * HTTP Method: Get
 * Request query:
 * - page:  * (number): Page number
 * - entries: (number): entries : default 20
 * - keyword：(string): username keyword for search
 *
 * Description:
 *
 * base the page and keyword get administrator list
 */

    @Get('tags/list')
    async list(@Query() dto: GetListDto) {
        return this.authService.getTags(dto);
    }
}