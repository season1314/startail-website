import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
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
    constructor(private readonly articles: ArticlesService) { }

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
     * Get tags list
     *
     * HTTP Method: Get
     * Request query:
     * - page:  * (number): Page number
     * - entries: (number): entries : default 20
     * - keyword：(string): username keyword for search
     *
     * Description:
     *
     * base the page and keyword get tags list
     */

    @Get('tags/list')
    async list(@Query() dto: GetListDto) {
        return this.articles.getTags(dto);
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
        return this.articles.createTag(dto, session.user.username)
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
        return this.articles.updateTag(dto)
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
        return this.articles.deleteTag(body.id)
    }

    /**
    *  Render articles page
    */
    @Get('content')
    @Render('backend/articles/content')
    contentIndex() {
        return {
            title: 'Articles',
        };
    }


    /**
     * Init create / edit article page
     *
     * HTTP Method:Get 
     * Request query:
     * - id:*(string):article Id
     *
     * Description:
     *
     * return data base id
     * id equal 0 return empty structure
     * base id find data and return
     */
    @Get('detail/:id')
    @Render('backend/articles/detail')
    async contentDetail(@Param('id') id: string | number) {
        return await this.articles.getDetail(id)
    }


    /**
      * Create new article
      *
      * HTTP Method:POST 
      * Request query:
      * - article data
      *
      * Description:
      *
      * valid english name,introduction not null
      * valid last one category
      * valid cover image not null 
      * check the caches avoid duplicate submission by same english name
      * create new article
      */
    @Post('detail')
    async createDetail(@Body() dto: any, @Session() session: Record<string, any>) {
        return await this.articles.createDetail(dto, session.user.username)
    }



    @Put('detail')
    async updateDetail(@Body() dto: any) {
        return await this.articles.updateArticles(dto)
    }







    /**
      * Get articles list
      *
      * HTTP Method:Get 
      * Request query:
      * - page:  * (number): Page number
      * - entries: (number): entries : default 20
      * - keyword：(string): username keyword for search
      * 
      * Description:
      *
      * base the page and keyword get tags list
      */
    @Get('content/list')
    async contentList(@Query() dto: GetListDto) {
        return await this.articles.contentList(dto)
    }
}