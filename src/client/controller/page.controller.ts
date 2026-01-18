import { Controller, Get, Post, Body, Render, Res, Req, Session, Delete, Put, Query, Param } from '@nestjs/common';
import { ArticlesClientService } from '../service/article.service'
import { ConfigClientService } from '../service/config.service'


@Controller()
export class HomeController {
    constructor(
        private readonly articlesClientService: ArticlesClientService,
        private readonly configClientService: ConfigClientService,
    ) {

    }

    /**
     *  Render home page
     */
    @Get('/')
    @Render('frontend/home')
    async index() {
        const articleList = await this.articlesClientService.getArticleList({ page: 1, entries: 20 })
        const categories = await this.configClientService.getConfigCategory()
        return {
            title: 'home',
            articleList: articleList.data.list,
            categories: categories.data,
            layout: 'frontend/layouts/main',
            menuActivated: "/"
        };
    }

    /**
     * Get home page article list
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
     * Get category page
     */
    @Get('/category/:category')
    @Render('frontend/home')
    async categoryPage(@Param('category') category: string) {
        const articleList = await this.articlesClientService.getArticleListByCategory({ page: 1, entries: 20 }, 'en', category)
        const categories = await this.configClientService.getConfigCategory()
        return {
            articleList: articleList.data.list,
            categories: categories.data,
            layout: 'frontend/layouts/main',
            menuActivated: category
        };
    }

    /**
    * Get category articles
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
     * Get tags page
     */
    @Get('/tags/:tagId')
    @Render('frontend/tags')
    async tagsPage(@Param('tagId') tagId: string) {
        const articleList = await this.articlesClientService.getArticleListByTagId({ page: 1, entries: 20 }, 'en', tagId)
        const categories = await this.configClientService.getConfigCategory()
        console.log(categories)
        console.log(articleList.data.tag)
        return {
            articleList: articleList.data.list,
            categories: categories.data,
            tag: articleList.data.tag,
            menuActivated: "tag",
            layout: 'frontend/layouts/main',
        }
    }

    /**
     * Get tags articles
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
}