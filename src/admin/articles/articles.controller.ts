import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query } from '@nestjs/common';
import type { Request, Response } from 'express';
// import { AuthService } from './auth.service';
import { error } from 'console';
import { TagsDto } from '../articles/articles.dto'
import * as session from 'express-session';
import { validate } from 'class-validator';
const { promisify } = require('util');
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



    /**
     * Create new tag
     *
     * HTTP Method: Post
     * Request query:
     * - name:  * (string): tag name
     * - lang: *  (object): tag lang {"en":"********","cn":"***********"}
     * - type:(string): tag type
     *
     * Description:
     *
     * check the name unique
     * create new
     */

    @Post('tags')
    async create(@Body() dto: TagsDto, @Session() session: Record<string, any>) {
        return this.authService.createTag(dto, session.user.username)
    }

    /**
 * Update tag
 *
 * HTTP Method:Put
 * Request query:
 * - id:*(string):tag Id
 * - name:  * (string): tag name
 * - lang: *  (object): tag lang {"en":"********","cn":"***********"}
 * - type:(string): tag type
 *
 * Description:
 *
 * check Id not null and tag is existing
 * check the name is unique
 * update tag 
 */

    @Put('tags')
    async update(@Body() dto: TagsDto) {
        return this.authService.updateTag(dto)
    }

    /**
     * Delete tag
     *
     * HTTP Method:Delete 
     * Request query:
     * - id:*(string):tag Id
     *
     * Description:
     *
     * check Id not null and tag is existing
     * delete tag 
     */
    @Delete('tags')
    async delete(@Query() body: any) {
        return this.authService.deleteTag(body.id)
    }
}