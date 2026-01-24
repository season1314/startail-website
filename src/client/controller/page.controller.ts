import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param, ConsoleLogger } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'
import { TokenToUser } from '../../common.decorator'
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express'




@Controller()
export class HomeController {
    constructor(
        private readonly articlesClientService: ArticlesClientService,
        private readonly configClientService: ConfigClientService,
        private jwtService: JwtService
    ) {

    }

    /** 
    * Render home page
    *
    * HTTP Method: GET   - 
    * Request TokenToUser:
    * - User: user data via token
    *
    * Description:
    * - Get home article list by language
    * - Get categories list by language
    * - Page Interface control value: menuActivated,sidebar,search
    * - User Info
    */

    @Get('/')
    @Render('frontend/home')
    async index(@TokenToUser() user: any) {
        const articleList = await this.articlesClientService.getArticleList({ page: 1, entries: 20 })
        const categories = await this.configClientService.getConfigCategory()
        return {
            articleList: articleList.data.list,
            categories: categories.data,
            layout: 'frontend/layouts/main',
            menuActivated: "/",
            sidebar: { login: true },
            search: true,
            user: user ? user : null
        };
    }

    /** 
    * Home article list
    *
    * HTTP Method: GET
    * Request query:
    * - Page: page number
    * - Entries: limit number 
    *
    * Description:
    * - Get home article list by language
    * - Page Interface control: layout
    * - Return render list to article partials html text 
    */
    @Get('/list')
    @Render('partials/frontend/article')
    async list(@Query('page') page = 1, @Query('entries') entries = 20) {
        const res = await this.articlesClientService.getArticleList({
            page: Number(page),
            entries: Number(entries)
        });
        return {
            articleList: res.data.list,
            layout: false
        };
    }

    /** 
    * Render category page
    *
    * HTTP Method: GET
    * Request param:
    * - category: category key
    * Request TokenToUser:
    * - User: user data via token
    * 
    * Description:
    * - Verify category existed by category key and language 
    * - Get article list by category and language
    * - Get categories list by language
    * - Page Interface control
    * - User Info
    */

    @Get('/category/:category')
    @Render('frontend/home')
    async categoryPage(@Param('category') category: string, @TokenToUser() user: any) {
        const articleList = await this.articlesClientService.getArticleListByCategory({ page: 1, entries: 20 }, 'en', category)
        const categories = await this.configClientService.getConfigCategory()
        return {
            articleList: articleList.data.list,
            categories: categories.data,
            layout: 'frontend/layouts/main',
            menuActivated: category,
            sidebar: { login: true },
            search: true,
            user: user
        };
    }

    /** 
  * Category article list
  *
  * HTTP Method: GET
  * 
  * Request param:
    - category: category key
  * Request query:
  * - Page: page number
  * - Entries: limit number 
  * - Category：category key
  *
  * Description:
  * - Verify category existed by category key
  * - Get home article list by category and language
  * - Page Interface control: layout
  * - Return render list to article partials html text 
  */
    @Get('/category/:category/list')
    @Render('partials/frontend/article')
    async categoryPageList(@Param('category') category: string, @Query('page') page = 1) {
        const res = await this.articlesClientService.getArticleListByCategory({ page, entries: 20 }, 'en', category)
        return {
            articleList: res.data.list,
            layout: false
        };
    }

    /** 
    * Render tag page
    *
    * HTTP Method: GET
    * Request param:
    * - tagId: tag id
    * Request TokenToUser:
    * - User: user data via token
    * 
    * Description:
    * - Verify tag existed by tag id
    * - Get article list by tag id and language
    * - Get categories list  by language
    * - Page Interface control
    * - User Info
    */

    @Get('/tags/:tagId')
    @Render('frontend/tags')
    async tagsPage(@Param('tagId') tagId: string, @TokenToUser() user: any) {
        const articleList = await this.articlesClientService.getArticleListByTagId({ page: 1, entries: 20 }, 'en', tagId)
        const categories = await this.configClientService.getConfigCategory()
        return {
            articleList: articleList.data.list,
            categories: categories.data,
            tag: articleList.data.tag,
            menuActivated: "tag",
            layout: 'frontend/layouts/main',
            sidebar: { login: true },
            search: true,
            user: user
        }
    }

    /** 
    * Tag article list
    *
    * HTTP Method: GET
    * Request param:
    * - tagId: tag id
    * Request query:
    * - Page: page number
    * - Entries: limit number 
    *
    * Description:
    * - Verify tag existed by tag id
    * - Get article list by tag id and language
    * - Page Interface control: layout
    * - Return render list to article partials html text 
    */
    @Get('tags/:tagId/list')
    @Render('partials/frontend/article')
    async tagsPageList(@Param('tagId') tagId: string, @Query('page') page = 1) {
        const res = await this.articlesClientService.getArticleListByTagId({ page, entries: 20 }, 'en', tagId)
        return {
            articleList: res.data.list,
            layout: false,
        }
    }

    /** 
    * Render search page
    *
    * HTTP Method: GET
    * Request query:
    * - Page*: page number
    * - Entries*: limit number
    * - keyword *: Keyword
    * - category：Category key
    *
    * Description:
    * - Verify tag existed by tag id
    * - Get article list by tag id and language
    * - Page Interface control: layout
    * - Return render list to article partials html text 
    */
    @Get('search')
    @Render('frontend/search')
    async searchPage(@Query('keyword') keyword: string = "", @Query('page') page = 1, @Query('category') category: string, @TokenToUser() user: any) {
        const articleList = await this.articlesClientService.searchArticles({ page, entries: 20 }, 'en', keyword, category)
        const categories = await this.configClientService.getConfigCategory()
        return {
            articleList: articleList.data.list,
            categories: categories.data,
            layout: 'frontend/layouts/main',
            menuActivated: 'tag',
            tag: { name: "Search" },
            sidebar: { login: true },
            subActivated: category ? category : "all",
            search: true,
            user: user,
            keyword: keyword
        };
    }


    /** 
    * Render search page
    *
    * HTTP Method: GET
    * Request query:
    * - Page*: page number
    * - Entries*: limit number
    * - keyword *: Keyword
    * - category：Category key
    *
    * Description:
    * - Verify tag existed by tag id
    * - Get article list by tag id and language
    * - Page Interface control: layout
    * - Return render list to article partials html text 
    */
    @Get('search/list')
    @Render('partials/frontend/article')
    async searchPageList(@Query('keyword') keyword: string = "", @Query('page') page = 1, @Query('category') category: string = "", @TokenToUser() user: any) {
        const res = await this.articlesClientService.searchArticles({ page, entries: 20 }, 'en', keyword, category)
        return {
            articleList: res.data.list,
            layout: false,
        }
    }

    /**
     * 
     * @param keyword 
     * @param page 
     * @param user 
     * @returns 
     */
    @Get('search/tag')
    @Render('frontend/search/tag')
    async searchTagsPage(@Query('keyword') keyword: string = "", @Query('page') page = 1, @TokenToUser() user: any) {
        const tagsList = await this.articlesClientService.tagsList({ page, entries: 30 }, 'en', keyword)
        const categories = await this.configClientService.getConfigCategory()
        return {
            tagsList: tagsList.data.list,
            categories: categories.data,
            layout: 'frontend/layouts/main',
            menuActivated: 'tag',
            tag: { name: "Search" },
            sidebar: { login: true },
            subActivated: "tags",
            search: true,
            user: user,
            keyword: keyword
        };
    }

    /**
     * 
     * @param keyword 
     * @param page 
     * @param user 
     * @returns 
     */
    @Get('search/tag/list')
    @Render('partials/frontend/tags')
    async searchTagsPageList(@Query('keyword') keyword: string = "", @Query('page') page = 1, @TokenToUser() user: any) {
        const res = await this.articlesClientService.tagsList({ page, entries: 30 }, 'en', keyword)
        return {
            tagsList: res.data.list,
            layout: false,
        }
    }

    /**
     * 
     */
    @Get('error')
    @Render('frontend/error')
    async errorPage(@Query('messages') messages: string = "An unknown error occurred. Please try again later.") {
        return {
            messages: messages,
            layout: false,
        }
    }



    @Get('favorite')
    @Render('frontend/user/favorite')
    async favoritePage(@Query('page') page = 1, @Query('category') category: string, @TokenToUser() user: any) {
        const userId = user.sub
        const articleList = await this.articlesClientService.favoriteArticleList({ page, entries: 20 }, 'en', category, userId)
        const categories = await this.configClientService.getConfigCategory()
        return {
            articleList: articleList.data.list,
            categories: categories.data,
            layout: 'frontend/layouts/main',
            menuActivated: 'tag',
            tag: { name: "Favorite" },
            sidebar: { login: false, filter: true },
            user: user,
            filterActivated: category ? category : 'all'
        };
    }

    @Get('favorite/list')
    @Render('partials/frontend/miniArticle')
    async favoritePageList(@Query('page') page, @Query('category') category: string, @TokenToUser() user: any) {
        const userId = user.sub
        const res = await this.articlesClientService.favoriteArticleList({ page, entries: 20 }, 'en', category, userId)
        return {
            articleList: res.data.list,
            layout: false,
        }
    }
}